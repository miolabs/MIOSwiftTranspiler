import org.antlr.v4.runtime.ParserRuleContext;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;

public class Literal {

    static public boolean isTuple(ParserRuleContext rChild) {
        SwiftParser.Expression_element_listContext tupleLiteral = ((SwiftParser.Primary_expressionContext) rChild).parenthesized_expression().expression_element_list();
        List<SwiftParser.Expression_elementContext> elementList = tupleLiteral.expression_element();
        if(elementList.size() <= 1) return false;
        return true;
    }
    static public PrefixElem getTuple(ParserRuleContext rChild, Visitor visitor, Instance type) {
        SwiftParser.Expression_element_listContext tupleLiteral = ((SwiftParser.Primary_expressionContext) rChild).parenthesized_expression().expression_element_list();
        List<SwiftParser.Expression_elementContext> elementList = tupleLiteral.expression_element();
        LinkedHashMap<String, Instance> types = new LinkedHashMap<String, Instance>();

        ArrayList<String> keys = null;
        if(type != null) keys = new ArrayList<String>(((ClassDefinition)type.definition).properties.keySet());

        for(int i = 0, elementI = 0; i < tupleLiteral.getChildCount(); i++) {
            if(!(tupleLiteral.getChild(i) instanceof SwiftParser.Expression_elementContext)) continue;
            SwiftParser.Expression_elementContext child = (SwiftParser.Expression_elementContext) tupleLiteral.getChild(i);
            String index = child.identifier() != null ? child.identifier().getText() : Integer.toString(elementI);
            if(type == null) types.put(index, TypeUtil.infer(child.expression(), visitor));
            elementI++;
        }

        if(type == null) {
            ClassDefinition tupleDefinition = new ClassDefinition(null, visitor.cache.find("Tuple", rChild), types, new ArrayList<Generic>(), false, new ArrayList<ClassDefinition>());
            type = new Instance(tupleDefinition);
        }
        String code = getTupleCode(keys, elementList, type, rChild, visitor);

        return new PrefixElem(code, false, false, type, null, null, null);
    }
    static public String getTupleCode(ArrayList<String> keys, List<SwiftParser.Expression_elementContext> elementList, Instance type, ParserRuleContext ctx, Visitor visitor) {
        String code = "";
        if(visitor.targetLanguage.equals("ts")) {
            code += "{";
            for(int i = 0; i < elementList.size(); i++) {
                String key = keys != null ? keys.get(i) : elementList.get(i).identifier() != null ? elementList.get(i).identifier().getText() : i + "";
                String val = visitor.visit(elementList.get(i).expression());
                if(i > 0) code += ",";
                code += "'" + key + "':" + val;
            }
            code += "}";
        }
        else {
            code += "new InitializableHashMap<String, Object>(";
            for(int i = 0; i < elementList.size(); i++) {
                String key = keys != null ? keys.get(i) : elementList.get(i).identifier() != null ? elementList.get(i).identifier().getText() : i + "";
                String val = visitor.visit(elementList.get(i).expression());
                if(i > 0) code += ",";
                code += "new Pair<String, " + type.getProperty(key).targetType(visitor.targetLanguage) + ">(\"" + key + "\", " + val + ")";
            }
            code += ")";
        }
        return code;
    }

    static public PrefixElem getArray(ParserRuleContext rChild, Instance type, List<? extends ParserRuleContext/*Expression_elementContext or Closure_expressionContext*/> functionCallParams, Visitor visitor) {

        SwiftParser.Array_literalContext arrayLiteral = ((SwiftParser.Primary_expressionContext) rChild).literal_expression().array_literal();

        if(arrayLiteral.array_literal_items() != null && type == null) {
            SwiftParser.ExpressionContext wrappedExpression = arrayLiteral.array_literal_items().array_literal_item(0).expression();
            Instance wrappedType = functionCallParams != null ? new Instance(wrappedExpression.getText(), rChild, visitor.cache) : TypeUtil.infer(wrappedExpression, visitor);
            type = new Instance("Array", rChild, visitor.cache);
            type.generics = new HashMap<String, Instance>();
            type.generics.put("Value", wrappedType);
        }

        String code = getArrayCode(arrayLiteral, rChild, type, functionCallParams, visitor);

        return new PrefixElem(code, false, false, type, null, null, null);
    }

    static public String getArrayCode(SwiftParser.Array_literalContext arrayLiteral, ParserRuleContext rChild, Instance type, List<? extends ParserRuleContext/*Expression_elementContext or Closure_expressionContext*/> functionCallParams, Visitor visitor) {

        String repeatedElement = null, arraySize = "";
        if(functionCallParams != null) {
            if(functionCallParams.size() == 2 && functionCallParams.get(0) instanceof SwiftParser.Expression_elementContext && ((SwiftParser.Expression_elementContext) functionCallParams.get(0)).identifier().getText().equals("repeating") && functionCallParams.get(1) instanceof SwiftParser.Expression_elementContext && ((SwiftParser.Expression_elementContext) functionCallParams.get(1)).identifier().getText().equals("count")) {
                arraySize = visitor.visit(((SwiftParser.Expression_elementContext) functionCallParams.get(1)).expression());
                repeatedElement = visitor.visit(((SwiftParser.Expression_elementContext) functionCallParams.get(0)).expression());
            }
        }

        if(visitor.targetLanguage.equals("ts")) {
            if(functionCallParams != null) {
                return "new Array(" + arraySize + ")" + (repeatedElement != null ? ".fill(" + repeatedElement + ")" : "");
            }
            else {
                String code = visitor.visit(rChild);
                if(type != null && type.typeName() != null && type.typeName().equals("Set")) code = "new Set(" + code + ")";
                return code;
            }
        }
        else {
            if(functionCallParams != null) {
                if(repeatedElement != null) {
                    return "new " + type.targetType(visitor.targetLanguage, true, false) + "(Collections.nCopies(" + arraySize + ", " + repeatedElement + "))";
                }
                return "new " + type.targetType(visitor.targetLanguage, true, false) + "(" + arraySize + ")";
            }
            else if(arrayLiteral.array_literal_items() != null) {
                List<SwiftParser.Array_literal_itemContext> values = arrayLiteral.array_literal_items().array_literal_item();
                String valuesList = "";
                for(int i = 0; i < values.size(); i++) {
                    valuesList += (i > 0 ? ", " : "") + values.get(i).getText();
                }
                return "new " + type.targetType(visitor.targetLanguage, true, false) + "(Arrays.asList(" + valuesList + "))";
            }
            else {
                return "new " + type.targetType(visitor.targetLanguage, true, false) + "()";
            }
        }
    }

    static public PrefixElem getDictionary(ParserRuleContext rChild, Instance type, List<? extends ParserRuleContext/*Expression_elementContext or Closure_expressionContext*/> functionCallParams, Visitor visitor) {

        SwiftParser.Dictionary_literalContext dictionaryLiteral = ((SwiftParser.Primary_expressionContext) rChild).literal_expression().dictionary_literal();
        String code;

        if(WalkerUtil.isDirectDescendant(SwiftParser.Empty_dictionary_literalContext.class, dictionaryLiteral)) {
            code = visitor.targetLanguage.equals("ts") ? "{}" : "new " + type.targetType(visitor.targetLanguage, true, false) + "()";
        }
        else {
            List<SwiftParser.ExpressionContext> keyVal = dictionaryLiteral.dictionary_literal_items().dictionary_literal_item(0).expression();
            if(type == null) {
                type = new Instance("Dictionary", rChild, visitor.cache);
                type.generics = new HashMap<String, Instance>();
                type.generics.put("Key", TypeUtil.infer(keyVal.get(0), visitor));
                type.generics.put("Value", TypeUtil.infer(keyVal.get(1), visitor));
            }
            code = getDictionaryInitializerCode(dictionaryLiteral, type, visitor);
        }

        return new PrefixElem(code, false, false, type, null, null, null);
    }

    static private String getDictionaryInitializerCode(SwiftParser.Dictionary_literalContext dictionaryLiteral, Instance dictionaryType, Visitor visitor) {
        if(visitor.targetLanguage.equals("ts")) {
            return '{' + visitor.visitWithoutStrings(dictionaryLiteral, "[]") + '}';
        }
        else {
            String diamond = dictionaryType.generics.get("Key").targetType(visitor.targetLanguage) + ", " + dictionaryType.generics.get("Value").targetType(visitor.targetLanguage);
            String code = "new " + dictionaryType.targetType(visitor.targetLanguage, true, false) + "(";
            List<SwiftParser.Dictionary_literal_itemContext> items = dictionaryLiteral.dictionary_literal_items().dictionary_literal_item();
            for(int i = 0; i < items.size(); i++) {
                code += (i > 0 ? ", " : "") + "new Pair<" + diamond + ">(" + visitor.visitChildren(items.get(i).expression(0)) + ", " + visitor.visitChildren(items.get(i).expression(1)) + ")";
            }
            code += ")";
            return code;
        }
    }

    static public PrefixElem getLiteral(ParserRuleContext rChild, Instance type, Visitor visitor) {
        String code = visitor.visit(rChild);
        if(WalkerUtil.isDirectDescendant(SwiftParser.Nil_literalContext.class, rChild)) {
            type = new Instance("Void", rChild, visitor.cache);
            code = "null ";
        }
        else {
            if(WalkerUtil.isDirectDescendant(SwiftParser.Integer_literalContext.class, rChild)) type = new Instance("Int", rChild, visitor.cache);
            else if(WalkerUtil.isDirectDescendant(SwiftParser.Numeric_literalContext.class, rChild)) type = new Instance("Double", rChild, visitor.cache);
            else if(WalkerUtil.isDirectDescendant(SwiftParser.String_literalContext.class, rChild)) type = new Instance("String", rChild, visitor.cache);
            else if(WalkerUtil.isDirectDescendant(SwiftParser.Boolean_literalContext.class, rChild)) type = new Instance("Bool", rChild, visitor.cache);
        }
        return new PrefixElem(code, false, false, type, null, null, null);
    }

    static public PrefixElem getClosure(ParserRuleContext rChild, Instance type, List<? extends ParserRuleContext/*Expression_elementContext or Closure_expressionContext*/> functionCallParams, Visitor visitor) {
        return new PrefixElem(FunctionUtil.closureExpression(((SwiftParser.Primary_expressionContext) rChild).closure_expression(), type, functionCallParams, visitor), false, false, type, null, null, null);
    }
}
