import org.antlr.v4.runtime.ParserRuleContext;
import org.antlr.v4.runtime.tree.ParseTree;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;

//deals with binary operations (e.g. a + b) -- tries to work out in which class the operation is defined
//(could be either first or second element, e.g. 1 + "2" could be defined either in Int or String)
//also has some hardcoded functionality for the conditional operator ?: and casting operator "as"
//handles some logic around assignments, e.g. optional assignment dictionary?["key"] = "val", but the bulk of that is done by Prefix
public class BinaryExpression implements PrefixOrExpression {

    Instance type;
    String code;
    ParserRuleContext originalCtx;
    public String code(ParseTree ctx, Visitor visitor) {return code;}
    public Instance type() {return type;}
    public ParserRuleContext originalCtx() {return originalCtx;}
    private Object/*Prefix_expressionContext or BinaryExpression*/ L;
    private Object/*Prefix_expressionContext or BinaryExpression*/ R;
    private ParserRuleContext operator;

    public BinaryExpression(Object L, Object R, ParserRuleContext operator) {
        this.L = L; this.R = R; this.operator = operator;
    }

    public void compute(Instance type, ParseTree ctx, Visitor visitor) {
        String alias = BinaryExpression.operatorAlias(operator);
        String definitionCode = null;

        PrefixOrExpression L, R;
        if(this.L instanceof SwiftParser.Prefix_expressionContext) {
            this.L = new Prefix((SwiftParser.Prefix_expressionContext) this.L, type, visitor);
            if(type == null && isAssignment(alias)) type = ((Prefix)this.L).type();
        }
        else if(this.L != null) {
            ((BinaryExpression)this.L).compute(type, ctx, visitor);
        }
        if(this.R instanceof SwiftParser.Prefix_expressionContext) {
            this.R = new Prefix((SwiftParser.Prefix_expressionContext) this.R, type, visitor);
        }
        else if(this.R != null) {
            ((BinaryExpression)this.R).compute(type, ctx, visitor);
        }
        L = (PrefixOrExpression)this.L;
        R = (PrefixOrExpression)this.R;

        if(operator instanceof SwiftParser.Conditional_operatorContext) {
            SwiftParser.Conditional_operatorContext conditionalOperator = (SwiftParser.Conditional_operatorContext)operator;
            Instance passType = TypeUtil.infer(conditionalOperator.expression(), visitor);
            Expression passExpression = new Expression(conditionalOperator.expression(), passType, visitor);
            this.type = TypeUtil.alternative(passExpression, R);
            this.code = L.code(ctx, visitor) + " ? " + passExpression.code + " : " + R.code(ctx, visitor);
        }
        else if(operator instanceof SwiftParser.Type_casting_operatorContext) {
            Instance castType = TypeUtil.fromDefinition(((SwiftParser.Type_casting_operatorContext) operator).type(), visitor);
            if(operator.getChild(0).getText().equals("as")) {
                this.type = castType;
                this.code = L.code(ctx, visitor);// + " as " + this.type.jsType();
            }
            else {
                this.type = new Instance("Bool", ctx, visitor.cache);
                this.code = L.code(ctx, visitor) + " instanceof " + this.type.targetType(visitor.targetLanguage);
            }
        }
        else {
            Operator operator = (Operator)visitor.cache.find(alias, ctx).object;
            String word = "OP_" + operator.word;

            String assignment = isAssignment(alias) ? R.type().typeName() != null && R.type().typeName().equals("Void") ? "N" : R.type().isOptional ? "TN" : "T" : null,
                   lCode = isAssignment(alias) ? ((Prefix)L).code(assignment, ctx, visitor) : L != null ? L.code(ctx, visitor) : "",
                   rCode = R != null ? R.code(ctx, visitor) : "";

            if(assignment != null) {
                if(lCode.equals("this")) {
                    definitionCode = "Object.assign(#A0, #A1)";
                }

                rCode = AssignmentUtil.augment(rCode, type, R.originalCtx(), visitor);
            }

            List<Instance> parameterTypes = new ArrayList<Instance>();
            List<String> parameterExternalNames = new ArrayList<String>();
            if(L != null) {
                parameterTypes.add(L.type());
                parameterExternalNames.add("");
            }
            else word += "_PREFIX";
            if(R != null) {
                parameterTypes.add(R.type());
                parameterExternalNames.add("");
            }
            else word += "_POSTFIX";
            Instance functionOwner = null;
            String augment = L != null ? FunctionUtil.augmentFromCall(word, parameterTypes, parameterExternalNames, L.type(), false, L.type().definition != null ? ((ClassDefinition) L.type().definition).getAllProperties() : null) : null;
            if(augment != null) functionOwner = L.type();
            else if(R != null) {
                augment = FunctionUtil.augmentFromCall(word, parameterTypes, parameterExternalNames, R.type(), false, R.type().definition != null ? ((ClassDefinition)R.type().definition).getAllProperties() : null);
                if(augment != null) functionOwner = R.type();
            }
            Instance function = augment != null ? functionOwner.getProperty(word + augment) : null;

            this.type = function != null ? function.result() : operator.result != null ? new Instance(operator.result) : TypeUtil.alternative(L, R);

            if(definitionCode == null) {
                Map<String, String> codeReplacement = L == null ? operator.codeReplacementPrefix : R == null ? operator.codeReplacementPostfix : operator.codeReplacementInfix;
                if(function != null && ((FunctionDefinition)function.definition).operator > 0) {
                    FunctionDefinition functionDefinition = (FunctionDefinition)function.definition;
                    definitionCode = ((ClassDefinition)functionOwner.definition).name + "." + word + augment + "(";
                    for(int i = 0; i < functionDefinition.parameterTypes.size(); i++) {
                        int argumentI = i + (functionDefinition.operator == 2 ? 1 : 0);
                        String argument = functionDefinition.parameterTypes.get(i).isInout ? "{get: () => #A" + argumentI + ", set: $val => #SA" + argumentI + "}" : "#A" + argumentI;
                        definitionCode += (i > 0 ? ", " : "") + argument;
                    }
                    definitionCode += ")";
                }
                else {
                    definitionCode =
                        augment != null && function.codeReplacement != null && function.codeReplacement.get(visitor.targetLanguage) != null ? function.codeReplacement.get(visitor.targetLanguage) :
                        codeReplacement != null && codeReplacement.containsKey(visitor.targetLanguage) ? codeReplacement.get(visitor.targetLanguage) :
                        "#A0 " + alias + " #A1";
                }
            }

            if(lCode.contains("#ASS")) this.code = lCode.replaceAll("#ASS", Matcher.quoteReplacement(rCode)).replaceAll("#NOASS", "");
            else if(lCode.contains("NOASS")) this.code = lCode.replaceAll("#NOASS", "");
            else this.code = definitionCode.replaceAll("#A0", Matcher.quoteReplacement(lCode)).replaceAll("#A1", Matcher.quoteReplacement(rCode));

            if(this.code.contains("#SA0")) {
                String valAssignment = ((Prefix)L).code(L.type().isOptional ? "TN" : "T", ctx, visitor);
                valAssignment = valAssignment.contains("#ASS") ? valAssignment.replaceAll("#ASS", Matcher.quoteReplacement("$val")) : valAssignment + " = $val";
                this.code = this.code.replaceAll("#SA0", Matcher.quoteReplacement(valAssignment));
            }
            if(this.code.contains("#SA1")) {
                String valAssignment = ((Prefix)R).code(R.type().isOptional ? "TN" : "T", ctx, visitor);
                valAssignment = valAssignment.contains("#ASS") ? valAssignment.replaceAll("#ASS", Matcher.quoteReplacement("$val")) : valAssignment + " = $val";
                this.code = this.code.replaceAll("#SA1", Matcher.quoteReplacement(valAssignment));
            }

            if(assignment != null && ((Prefix) L).hasOptionals()) {
                this.code = "if(" + optionalsGuardingIf(((Prefix) L), assignment, ctx, visitor) + "){" + this.code + ";}";
            }
        }
    }

    static public boolean operatorBelongsToPrecedenceGroup(ParserRuleContext operator, PrecedenceGroup precedenceGroup, ParseTree ctx, Visitor visitor) {
        String operatorAlias = BinaryExpression.operatorAlias(operator);
        return ((Operator)visitor.cache.find(operatorAlias, ctx).object).precedenceGroup == precedenceGroup;
    }

    static public String operatorAlias(ParserRuleContext operator) {
        if(operator instanceof SwiftParser.Conditional_operatorContext) return "?:";
        if(operator instanceof SwiftParser.Type_casting_operatorContext) return operator.getChild(0).getText();
        return operator.getText();
    }

    static private boolean isAssignment(String alias) {
        //TODO do a proper check, for instance mind overloaded operators
        return alias.equals("=");// || alias.equals("+=") || alias.equals("-=") || alias.equals("*=") || alias.equals("/=") || alias.equals("%=");
    }

    static private String optionalsGuardingIf(Prefix L, String assignment, ParseTree ctx, Visitor visitor) {
        String ifCode = "";
        for(int i = 0; i < L.elems.size(); i++) {
            if(L.elems.get(i).isOptional) ifCode += (ifCode.length() > 0 ? " && " : "") + "(" + L.code(assignment, i, ctx, visitor) + ") != null";
        }
        return ifCode;
    }

    static public boolean isOptionalChainingOperator(SwiftParser.Postfix_operatorContext ctx) {
        String alias = ctx.getText();
        return alias.equals("?") || alias.equals("!");
    }
}
