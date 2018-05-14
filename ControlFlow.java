import org.antlr.v4.runtime.ParserRuleContext;

import java.util.ArrayList;
import java.util.List;

class IfLet {
    public ArrayList<String> varNames = new ArrayList<String>();
    public ArrayList<String> varVals = new ArrayList<String>();
    public ArrayList<Instance> varTypes = new ArrayList<Instance>();
    public IfLet(ParserRuleContext ctx, Visitor visitor) {
        SwiftParser.Condition_clauseContext conditionClause = ctx instanceof SwiftParser.If_statementContext ? ((SwiftParser.If_statementContext)ctx).condition_clause() : ((SwiftParser.Guard_statementContext)ctx).condition_clause();
        if(!(WalkerUtil.isDirectDescendant(SwiftParser.Optional_binding_conditionContext.class, conditionClause))) return;

        ArrayList<SwiftParser.Optional_binding_headContext> ifLets = new ArrayList<SwiftParser.Optional_binding_headContext>();
        ifLets.add(conditionClause.condition_list().condition(0).optional_binding_condition().optional_binding_head());
        if(conditionClause.condition_list().condition(0).optional_binding_condition().optional_binding_continuation_list() != null) {
            List<SwiftParser.Optional_binding_headContext> moreIfLets = conditionClause.condition_list().condition(0).optional_binding_condition().optional_binding_continuation_list().optional_binding_head();
            for(int i = 0; i < moreIfLets.size(); i++) ifLets.add(moreIfLets.get(i));
        }
        for(int i = 0; i < ifLets.size(); i++) {
            String varName = visitor.visitWithoutTerminals(ifLets.get(i).pattern()).trim();
            Expression varVal = new Expression((ifLets.get(i).initializer()).expression(), null, visitor);
            varNames.add(varName);
            varVals.add(varVal.code);
            varTypes.add(varVal.type);
        }
    }
}
public class ControlFlow {

    static class RangeOperator {
        String from, to, comparator;
        RangeOperator(SwiftParser.ExpressionContext expression, Visitor visitor) {
            if(expression.binary_expressions() != null && expression.binary_expressions().binary_expression().size() > 0) {
                SwiftParser.Binary_expressionContext binary = expression.binary_expressions().binary_expression(0);
                from = visitor.visit(expression.prefix_expression());
                to = new Expression(expression, null, true, visitor).code;
                String binaryOperator = BinaryExpression.operatorAlias(binary.binary_operator());
                comparator = binaryOperator.equals("...") ? "<=" : binaryOperator.equals("..<") ? "<" : null;
            }
        }
    }

    static public String forIn(SwiftParser.For_in_statementContext ctx, Visitor visitor) {
        SwiftParser.ExpressionContext expression = ctx.expression();

        if(expression != null && expression.binary_expressions() != null) {
            RangeOperator rangeOperator = new RangeOperator(expression, visitor);
            String varName = ctx.pattern().getText().equals("_") ? "$" : ctx.pattern().getText();
            return "for(" + (visitor.targetLanguage.equals("ts") ? "let" : "int") + " " + varName + " = " + rangeOperator.from + "; " + varName + " " + rangeOperator.comparator + " (" + rangeOperator.to + "); " + varName + "++) " + visitor.visit(ctx.code_block());
        }

        Expression iteratedObject = new Expression(expression, null, visitor);
        Instance iteratedType = iteratedObject.type;
        String indexVar = null, valueVar;
        if(ctx.pattern().tuple_pattern() != null) {
            indexVar = ctx.pattern().tuple_pattern().tuple_pattern_element_list().tuple_pattern_element(0).getText();
            valueVar = ctx.pattern().tuple_pattern().tuple_pattern_element_list().tuple_pattern_element(1).getText();
        }
        else {
            valueVar = ctx.pattern().identifier_pattern().getText();
        }

        String iterator;
        if(visitor.targetLanguage.equals("ts")) {
            if(iteratedType.typeName() != null && (iteratedType.typeName().equals("Array") || iteratedType.typeName().equals("Set") || iteratedType.typeName().equals("String"))) {
                if(indexVar == null) indexVar = "$";
                iterator = "for(let " + indexVar + " = 0; " + indexVar + " < (" + iteratedObject.code + ").length; " + indexVar + "++) { let " + valueVar + " = (" + iteratedObject.code + ")[" + indexVar + "];";
            }
            else {
                if(indexVar == null) iterator = "for(let " + valueVar + " of " + iteratedObject.code + ") {";
                else iterator = "for(let " + indexVar + " in " + iteratedObject.code + ") { let " + valueVar + " = (" + iteratedObject.code + ")[" + indexVar + "];";
            }
        }
        else {
            if(iteratedType.typeName() != null && (iteratedType.typeName().equals("Array") || iteratedType.typeName().equals("Set") || iteratedType.typeName().equals("String"))) {
                if(indexVar == null) indexVar = "$";
                String targetType = iteratedType.typeName() != null && iteratedType.typeName().equals("String") ? new Instance("String", ctx, visitor.cache).targetType("java") : iteratedType.generics.get("Value").targetType("java");
                iterator = "for(int " + indexVar + " = 0; " + indexVar + " < (" + iteratedObject.code + ").size(); " + indexVar + "++) { " + targetType + " " + valueVar + " = (" + iteratedObject.code + ").get(" + indexVar + ");";
            }
            else {
                String[] iteratedTypeChunks = iteratedType.targetType("java").split("<");
                iterator = "for(" + iteratedTypeChunks[0] + ".Entry<" + iteratedTypeChunks[1] + " $ : (" + iteratedObject.code + ").entrySet()) {";
                if(indexVar != null) iterator += iteratedType.generics.get("Key").targetType("java") + " " + indexVar + " = $.getKey();";
                iterator += iteratedType.generics.get("Value").targetType("java") + " " + valueVar + " = $.getValue();";
            }
        }

        return iterator + visitor.visitWithoutStrings(ctx.code_block(), "{");
    }

    static public String whileRepeat(SwiftParser.While_statementContext ctx, Visitor visitor) {
        return "while(" + visitor.visit(ctx.condition_clause()) + ") " + visitor.visit(ctx.code_block());
    }

    static public String repeatWhile(SwiftParser.Repeat_while_statementContext ctx, Visitor visitor) {
        return "do " + visitor.visit(ctx.code_block()) + "while(" + visitor.visit(ctx.expression()) + ")";
    }

    static private String ifOrGuard(ParserRuleContext ctx, Visitor visitor) {
        String condition = "", beforeBlock = "";
        IfLet ifLet = new IfLet(ctx, visitor);
        if(ifLet.varNames.size() > 0) {
            for(int i = 0; i < ifLet.varNames.size(); i++) {
                condition +=
                        (condition.length() > 0 ? " && " : "") +
                        (visitor.targetLanguage.equals("ts") ? "(_.$ifLet" + i + " = " + ifLet.varVals.get(i) + ")" : ifLet.varVals.get(i)) +
                        " != null";
                beforeBlock +=
                    visitor.targetLanguage.equals("ts") ? (beforeBlock.length() > 0 ? ", " : "") + ifLet.varNames.get(i) + ":" + ifLet.varTypes.get(i).targetType(visitor.targetLanguage) + " = _.$ifLet" + i
                    : ifLet.varTypes.get(i).targetType(visitor.targetLanguage) + " " + ifLet.varNames.get(i) + " = " + ifLet.varVals.get(i) + ";";
            }
            if(visitor.targetLanguage.equals("ts")) beforeBlock = "const " + beforeBlock + ";";
        }
        else {
            condition = visitor.visitWithoutStrings(ctx instanceof SwiftParser.If_statementContext ? ((SwiftParser.If_statementContext)ctx).condition_clause() : ((SwiftParser.Guard_statementContext)ctx).condition_clause(), "()");
        }
        if(ctx instanceof SwiftParser.Guard_statementContext) condition = "!(" + condition + ")";
        return "if(" + condition + ") {" + beforeBlock + visitor.visitWithoutStrings(ctx instanceof SwiftParser.If_statementContext ? ((SwiftParser.If_statementContext)ctx).code_block() : ((SwiftParser.Guard_statementContext)ctx).code_block(), "{") + (ctx instanceof SwiftParser.If_statementContext ? visitor.visitChildren(((SwiftParser.If_statementContext)ctx).else_clause()) : "");
    }

    static public String ifThen(SwiftParser.If_statementContext ctx, Visitor visitor) {
        return ifOrGuard(ctx, visitor);
    }
    static public String guard(SwiftParser.Guard_statementContext ctx, Visitor visitor) {
        return ifOrGuard(ctx, visitor);
    }

    static private String switchCondition(SwiftParser.Switch_caseContext ctx, Visitor visitor) {
        if(ctx.default_label() != null) return "true";

        String result = "";
        SwiftParser.Case_item_listContext caseItem = ctx.case_label().case_item_list();
        while(caseItem != null) {
            if(result.length() > 0) {
                result += " || ";
            }
            if(WalkerUtil.isDirectDescendant(SwiftParser.Tuple_patternContext.class, caseItem)) {
                List<SwiftParser.Tuple_pattern_elementContext> tuples = caseItem.pattern().tuple_pattern().tuple_pattern_element_list().tuple_pattern_element();
                result += "(";
                for(int i = 0; i < tuples.size(); i++) {
                    if(visitor.visitChildren(tuples.get(i)).trim().equals("_")) continue;
                    if(result.length() > 1) result += " && ";
                    result += switchSingleCondition("$switch[" + i + "]", tuples.get(i).pattern(), visitor);
                }
                result += ")";
            }
            else result += switchSingleCondition("$switch", caseItem.pattern(), visitor);
            caseItem = caseItem.case_item_list();
        }
        return result;
    }
    static private String switchSingleCondition(String varName, SwiftParser.PatternContext ctx, Visitor visitor) {
        RangeOperator rangeOperator = null;
        if(WalkerUtil.isDirectDescendant(SwiftParser.ExpressionContext.class, ctx)) {
            rangeOperator = new RangeOperator(ctx.expression_pattern().expression(), visitor);
        }
        if(rangeOperator != null && rangeOperator.comparator != null) {
            return "(" + varName + " >= (" + rangeOperator.from + ") && " + varName + " " + rangeOperator.comparator + " (" + rangeOperator.to + "))";
        }
        else {
            return "(" + varName + " === " + visitor.visitChildren(ctx) + ")";
        }
    }

    static public String switchStatement(SwiftParser.Switch_statementContext ctx, Visitor visitor) {
        String result = "";

        result += "const $switch = " + visitor.visitChildren(ctx.expression()) + ";\n";

        List<SwiftParser.Switch_caseContext> switchCases = new ArrayList<SwiftParser.Switch_caseContext>();
        SwiftParser.Switch_casesContext currSwitchCases = ctx.switch_cases();
        while(currSwitchCases != null) {
            switchCases.add(currSwitchCases.switch_case());
            currSwitchCases = currSwitchCases.switch_cases();
        }

        for(int i = 0; i < switchCases.size(); i++) {
            if(i > 0) result += "else ";
            int j = 0;
            for(; j < switchCases.size() - i; j++) {
                //if the i+j'th case doesn't have fallthrough, break
                if(!WalkerUtil.isDirectDescendant(SwiftParser.Fallthrough_statementContext.class, switchCases.get(i + j).statements().statement(switchCases.get(i + j).statements().statement().size() - 1))) break;
            }
            result += "if((";
            for(int k = i; k <= i + j; k++) {
                if(k > i) result += ") || (";
                result += switchCondition(switchCases.get(k), visitor);
            }
            result += ")) {\n";
            for(int k = i; k <= i + j; k++) {
                if(k < i + j) {
                    result += "if((";
                    for(int l = i; l <= k; l++) {
                        if(l > i) result += ") || (";
                        result += switchCondition(switchCases.get(l), visitor);
                    }
                    result += ")) {\n";
                }
                result += visitor.visitChildren(switchCases.get(k).statements());
                if(k < i + j) result += "}\n";
            }
            result += "}\n";
            i += j;
        }

        return result;
    }
}
