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

    static public String switchCondition(Instance switchedType, SwiftParser.Switch_caseContext ctx, List<String> valueBindingNames, List<String> valueBindingExpressions, List<Instance> valueBindingTypes, Visitor visitor) {
        if(ctx.default_label() != null) return "true";

        EnumerationDefinition enumerationDefinition = switchedType.enumerationDefinition != null ? (EnumerationDefinition)visitor.cache.find(switchedType.enumerationDefinition, ctx).object : null;

        String result = "(";
        SwiftParser.Case_item_listContext caseItem = ctx.case_label().case_item_list();
        while(caseItem != null) {
            if(result.length() > 1) {
                result += " || ";
            }
            result += switchSingleCondition(switchedType, enumerationDefinition, "$switch", caseItem.pattern(), valueBindingNames, valueBindingExpressions, valueBindingTypes, visitor);
            if(caseItem.where_clause() != null) {
                visitor.varNameReplacements = new ArrayList<String>();
                for(int v = 0; v < valueBindingNames.size(); v++) {
                    visitor.varNameReplacements.add(valueBindingNames.get(v));
                    visitor.varNameReplacements.add(valueBindingExpressions.get(v));
                }
                result += ") && (" + visitor.visit(ctx.case_label().case_item_list().where_clause().where_expression().expression());
                visitor.varNameReplacements = null;
            }
            caseItem = caseItem.case_item_list();
        }
        result += ")";
        return result;
    }
    static private String switchSingleCondition(Instance switchedType, EnumerationDefinition enumerationDefinition, String varName, SwiftParser.PatternContext ctx, List<String> valueBindingNames, List<String> valueBindingExpressions, List<Instance> valueBindingTypes, Visitor visitor) {

        if(WalkerUtil.isDirectDescendant(SwiftParser.Value_binding_patternContext.class, ctx)) {
            SwiftParser.PatternContext pattern = ctx.value_binding_pattern().pattern();
            if(valueBindingNames != null) {
                switchValueBinding(switchedType, enumerationDefinition, varName, pattern, valueBindingNames, valueBindingExpressions, valueBindingTypes, visitor);
            }
            if(pattern.enum_case_pattern() != null) {
                String caseName = pattern.enum_case_pattern().enum_case_name().identifier().getText();
                return varName + ".chosen === " + enumerationDefinition.rawValues.get(caseName);
            }
            return "true";
        }

        if(WalkerUtil.isDirectDescendant(SwiftParser.Enum_case_patternContext.class, ctx)) {
            String caseName = ctx.enum_case_pattern().enum_case_name().identifier().getText();
            SwiftParser.Tuple_patternContext tuple = ctx.enum_case_pattern().tuple_pattern();
            String result = "(";
            boolean isTuple = enumerationDefinition.tupleTypes != null;
            result += varName + (isTuple ? ".chosen" : "") + " === " + enumerationDefinition.rawValues.get(caseName);
            if(tuple != null) {
                List<SwiftParser.Tuple_pattern_elementContext> tuples = tuple.tuple_pattern_element_list().tuple_pattern_element();
                for(int i = 0; i < tuples.size(); i++) {
                    if(visitor.visitChildren(tuples.get(i)).trim().equals("_")) continue;
                    if(result.length() > 1) result += " && ";
                    result += switchSingleCondition(enumerationDefinition.tupleTypes.get(caseName).getProperty(i + ""), enumerationDefinition, varName + ".tuple[" + i + "]", tuples.get(i).pattern(), valueBindingNames, valueBindingExpressions, valueBindingTypes, visitor);
                }
            }
            result += ")";
            return result;
        }

        if(WalkerUtil.isDirectDescendant(SwiftParser.Tuple_patternContext.class, ctx)) {
            List<SwiftParser.Tuple_pattern_elementContext> tuples = ctx.tuple_pattern().tuple_pattern_element_list().tuple_pattern_element();
            String result = "(";
            for(int i = 0; i < tuples.size(); i++) {
                if(visitor.visitChildren(tuples.get(i)).trim().equals("_")) continue;
                if(result.length() > 1) result += " && ";
                result += switchSingleCondition(switchedType.getProperty(i + ""), enumerationDefinition, varName + "[" + i + "]", tuples.get(i).pattern(), valueBindingNames, valueBindingExpressions, valueBindingTypes, visitor);
            }
            result += ")";
            return result;
        }

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
    static private void switchValueBinding(Instance switchedType, EnumerationDefinition enumerationDefinition, String varName, SwiftParser.PatternContext ctx, List<String> valueBindingNames, List<String> valueBindingExpressions, List<Instance> valueBindingTypes, Visitor visitor) {

        if(WalkerUtil.isDirectDescendant(SwiftParser.Enum_case_patternContext.class, ctx)) {
            String caseName = ctx.enum_case_pattern().enum_case_name().identifier().getText();
            List<SwiftParser.Tuple_pattern_elementContext> tuples = ctx.enum_case_pattern().tuple_pattern().tuple_pattern_element_list().tuple_pattern_element();
            for(int i = 0; i < tuples.size(); i++) {
                switchValueBinding(enumerationDefinition.tupleTypes.get(caseName).getProperty(i + ""), enumerationDefinition, varName + ".tuple[" + i + "]", tuples.get(i).pattern(), valueBindingNames, valueBindingExpressions, valueBindingTypes, visitor);
            }
        }
        else if(WalkerUtil.isDirectDescendant(SwiftParser.Tuple_patternContext.class, ctx)) {
            List<SwiftParser.Tuple_pattern_elementContext> tuples = ctx.tuple_pattern().tuple_pattern_element_list().tuple_pattern_element();
            for(int i = 0; i < tuples.size(); i++) {
                switchValueBinding(switchedType.getProperty(i + ""), enumerationDefinition, varName + "[" + i + "]", tuples.get(i).pattern(), valueBindingNames, valueBindingExpressions, valueBindingTypes, visitor);
            }
        }
        else {
            valueBindingNames.add(visitor.visitChildren(ctx).trim());
            valueBindingExpressions.add(varName);
            valueBindingTypes.add(switchedType);
        }
    }

    static public String switchStatement(SwiftParser.Switch_statementContext ctx, Visitor visitor) {
        String result = "";

        Instance switchedType = TypeUtil.infer(ctx.expression(), visitor);
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
            List<String> valueBindingNames = new ArrayList<String>();
            List<String> valueBindingExpressions = new ArrayList<String>();
            List<Instance> valueBindingTypes = new ArrayList<Instance>();
            for(int k = i; k <= i + j; k++) {
                if(k > i) result += ") || (";
                result += switchCondition(switchedType, switchCases.get(k), valueBindingNames, valueBindingExpressions, valueBindingTypes, visitor);
            }
            result += ")) {\n";
            for(int v = 0; v < valueBindingNames.size(); v++) {
                result += "const " + valueBindingNames.get(v) + " = " + valueBindingExpressions.get(v) + ";\n";
            }
            for(int k = i; k <= i + j; k++) {
                if(k < i + j) {
                    result += "if((";
                    for(int l = i; l <= k; l++) {
                        if(l > i) result += ") || (";
                        result += switchCondition(switchedType, switchCases.get(l), null, null, null, visitor);
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
