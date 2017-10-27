import org.antlr.v4.runtime.ParserRuleContext;
import org.antlr.v4.runtime.tree.ParseTree;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;

public class BinaryExpression implements PrefixOrExpression {

    static public int minOperatorPriority = 4;
    static public int maxOperatorPriority = 10;

    Instance type;
    String code;
    ParserRuleContext originalCtx;
    public String code(ParseTree ctx, Visitor visitor) {return code;}
    public Instance type() {return type;}
    public ParserRuleContext originalCtx() {return originalCtx;}
    private Object L;
    private Object R;
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
        else ((BinaryExpression)this.L).compute(type, ctx, visitor);
        if(this.R instanceof SwiftParser.Prefix_expressionContext) {
            this.R = new Prefix((SwiftParser.Prefix_expressionContext) this.R, type, visitor);
        }
        else if(this.R != null) ((BinaryExpression)this.R).compute(type, ctx, visitor);
        L = (PrefixOrExpression)this.L;
        R = (PrefixOrExpression)this.R;

        if(operator instanceof SwiftParser.Conditional_operatorContext) {
            //TODO should be grouping conditionals from right to left, e.g. true ? 1 : true ? 2 : 3 to true ? 1 : (true ? 2 : 3), currently that would be evaluated as 'true ? 1 : true'
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
            String lCode = isAssignment(alias) ? ((Prefix)L).code(true, ctx, visitor) : L.code(ctx, visitor), rCode = R.code(ctx, visitor),
                   ifCode0 = null, ifCode1 = null, elseCode1 = null;

            if(isAssignment(alias)) {
                if(((Prefix) L).isDictionaryIndex()) {
                    if(R.type().uniqueId().equals("Void")) {
                        if(visitor.targetLanguage.equals("ts")) {
                            lCode = "delete " + lCode; rCode = ""; definitionCode = "#A0";
                        }
                        else {
                            lCode = ((Prefix)L).code(false, ((Prefix)L).elems.size() - 1, ctx, visitor) + ".remove(" + ((Prefix)L).elems.get(((Prefix)L).elems.size() - 1).code + ")"; rCode = ""; definitionCode = "#A0";
                        }
                    }
                    else if(R.type().isOptional) {
                        ifCode1 = "(" + rCode + ") != null";
                        if(((Prefix) L).isAssignmentReplacement()) definitionCode = "#A0 #A1)";
                        elseCode1 = visitor.targetLanguage.equals("ts") ? "delete " + lCode : ((Prefix)L).code(false, ((Prefix)L).elems.size() - 1, ctx, visitor) + ".remove(" + ((Prefix)L).elems.get(((Prefix)L).elems.size() - 1).code + ")";
                    }
                    else if(((Prefix) L).isAssignmentReplacement()) {
                        definitionCode = "#A0 #A1)";
                    }
                }

                if(((Prefix) L).hasOptionals()) {
                    ifCode0 = optionalsGuardingIf(((Prefix) L), ctx, visitor);
                }

                if(!((Prefix) L).isDictionaryIndex() && !((Prefix) L).hasOptionals() && ((Prefix) L).isAssignmentReplacement()) {
                    definitionCode = "#A0 #A1)";
                }

                if(lCode.equals("this")) {
                    definitionCode = "Object.assign(#A0, #A1)";
                }

                //not sure what that bit does :(
                //if(type instanceof FunctionDefinition && R.type() != null) type = R.type();
                rCode = AssignmentUtil.augment(rCode, type, R.originalCtx(), visitor);
            }

            List<Instance> parameterTypes = new ArrayList<Instance>();
            List<String> parameterExternalNames = new ArrayList<String>();
            parameterTypes.add(L.type());
            parameterExternalNames.add("");
            if(R != null) {
                parameterTypes.add(R.type());
                parameterExternalNames.add("");
            }
            Instance functionOwner = null;
            String augment = FunctionUtil.augmentFromCall(alias, parameterTypes, parameterExternalNames, L.type(), false, ((ClassDefinition)L.type().definition).getAllProperties());
            if(augment != null) functionOwner = L.type();
            else {
                augment = FunctionUtil.augmentFromCall(alias, parameterTypes, parameterExternalNames, R.type(), false, ((ClassDefinition)L.type().definition).getAllProperties());
                if(augment != null) functionOwner = R.type();
            }

            Operator operator = (Operator)visitor.cache.find(alias, ctx).object;
            
            this.type = augment != null ? functionOwner.getProperty(alias + augment).result() : operator.result != null ? new Instance(operator.result) : TypeUtil.alternative(L, R);

            if(definitionCode == null) {
                definitionCode =
                    augment != null && functionOwner.getProperty(alias + augment).codeReplacement != null ? functionOwner.getProperty(alias + augment).codeReplacement.get(visitor.targetLanguage) :
                    //TODO perhaps add that later; currently screws with native operations, e.g. "" + "": augment != null ? functionOwner.targetType(visitor.targetLanguage, true, true) + "." + alias + "(#A0, #A1)" :
                    operator.codeReplacement != null ? operator.codeReplacement.get(visitor.targetLanguage) :
                    "#A0 " + alias + " #A1";
            }
            this.code = definitionCode.replaceAll("#A0", Matcher.quoteReplacement(lCode)).replaceAll("#A1", Matcher.quoteReplacement(rCode));
            if(ifCode1 != null) this.code = "if(" + ifCode1 + ") { " + this.code + "; } else { " + elseCode1 + "; }";
            if(ifCode0 != null) this.code = "if(" + ifCode0 + ") { " + this.code + "; }";
        }
    }

    static public int priorityForOperator(ParserRuleContext operator, ParseTree ctx, Visitor visitor) {
        String operatorAlias = BinaryExpression.operatorAlias(operator);
        return ((Operator)visitor.cache.find(operatorAlias, ctx).object).priority;
    }
    static public String operatorAlias(ParserRuleContext operator) {
        if(operator instanceof SwiftParser.Conditional_operatorContext) return "?:";
        if(operator instanceof SwiftParser.Type_casting_operatorContext) return operator.getChild(0).getText();
        return operator.getText();
    }

    static private boolean isAssignment(String alias) {
        return alias.equals("=") || alias.equals("+=") || alias.equals("-=") || alias.equals("*=") || alias.equals("/=") || alias.equals("%=");
    }

    static private String optionalsGuardingIf(Prefix L, ParseTree ctx, Visitor visitor) {
        String ifCode = "";
        for(int i = 0; i < L.elems.size(); i++) {
            if(L.elems.get(i).isOptional) ifCode += (ifCode.length() > 0 ? " && " : "") + L.code(true, i, ctx, visitor) + " != null";
        }
        return ifCode;
    }
}
