import org.antlr.v4.runtime.ParserRuleContext;

import java.util.*;

//deals with primary_expression and chain_postfix_expression context (as defined in Swift.g4), e.g instance.method() or instance[2]
//primary_expression is always the first element in the chain and can be an identifier (varA) or a literal ([] or 1)
//works out the type from the identifier/literal
//also has some hardcoded functionality for more complicated literals such as ["key": "val"] or [Int](repeating: 0, count: 3)
//chain_postfix_expression are the successive elements in the chain, such as .methodCall() or [2]
public class PrefixElem {
    public String code;
    public boolean isSubscript;
    public boolean replaceWithSubscript;
    public Instance type;
    public List<String> functionCallParams;
    public Object/*Definition/Instance*/ typeBeforeCall;
    public String initializerSignature;
    public boolean isOptional;
    public PrefixElem(String code, boolean isSubscript, boolean replaceWithSubscript, Instance type, List<String> functionCallParams, Object typeBeforeCall, String initializerSignature) { this.code = code; this.isSubscript = isSubscript; this.replaceWithSubscript = replaceWithSubscript; this.type = type; this.functionCallParams = functionCallParams; this.typeBeforeCall = typeBeforeCall; this.initializerSignature = initializerSignature; this.isOptional = false; }

    static public PrefixElem get(ParserRuleContext rChild, List<? extends ParserRuleContext/*Expression_elementContext or Closure_expressionContext*/> functionCallParams, ArrayList<ParserRuleContext> chain, int chainPos, Instance lType, Instance rType, Visitor visitor) {

        if(chainPos == 0 && WalkerUtil.isDirectDescendant(SwiftParser.Parenthesized_expressionContext.class, rChild)) {
            if(Literal.isTuple(rChild)) {
                return Literal.getTuple(rChild, visitor, rType);
            }
            else {
                Expression parenthesized = new Expression(((SwiftParser.Primary_expressionContext) rChild).parenthesized_expression().expression_element_list().expression_element(0).expression(), rType, visitor);
                return new PrefixElem("(" + parenthesized.code + ")", false, false, parenthesized.type, null, null, null);
            }
        }
        if(chainPos == 0 && WalkerUtil.isDirectDescendant(SwiftParser.Array_literalContext.class, rChild)) {
            return Literal.getArray(rChild, rType, functionCallParams, visitor);
        }
        if(chainPos == 0 && WalkerUtil.isDirectDescendant(SwiftParser.Dictionary_literalContext.class, rChild)) {
            return Literal.getDictionary(rChild, rType, functionCallParams, visitor);
        }
        if(chainPos == 0 && WalkerUtil.isDirectDescendant(SwiftParser.LiteralContext.class, rChild)) {
            return Literal.getLiteral(rChild, rType, visitor);
        }
        if(chainPos == 0 && WalkerUtil.isDirectDescendant(SwiftParser.Closure_expressionContext.class, rChild)) {
            return Literal.getClosure(rChild, rType, functionCallParams, visitor);
        }
        return getBasic(rChild, functionCallParams, chain, chainPos, lType, rType, visitor);
    }

    static private PrefixElem getBasic(ParserRuleContext rChild, List<? extends ParserRuleContext/*Expression_elementContext or Closure_expressionContext*/> functionCallParams, ArrayList<ParserRuleContext> chain, int chainPos, Instance lType, Instance rType, Visitor visitor) {
        String code;
        boolean isSubscript = false;
        boolean replaceWithSubscript = false;
        List<String> functionCallParamsStr = null;
        Instance type = null;
        Object typeBeforeCall = null;
        if(rChild instanceof SwiftParser.Explicit_member_expressionContext) {
            code = ((SwiftParser.Explicit_member_expressionContext) rChild).identifier().getText();
        }
        else if(WalkerUtil.isDirectDescendant(SwiftParser.Implicit_member_expressionContext.class, rChild)) {
            return Enumeration.getPrefixElem(rChild, functionCallParams, null, rType, visitor);
        }
        else if(rChild instanceof SwiftParser.Primary_expressionContext) {
            code = ((SwiftParser.Primary_expressionContext) rChild).identifier() != null ? ((SwiftParser.Primary_expressionContext) rChild).identifier().getText() : visitor.visit(rChild);
        }
        else if(rChild instanceof SwiftParser.Initializer_expressionContext) {
            code = "init";
        }
        else if(rChild instanceof SwiftParser.Subscript_expressionContext) {
            functionCallParams = ((SwiftParser.Subscript_expressionContext) rChild).expression_list().expression();
            code = "OP_subscript";
            isSubscript = true;
        }
        else if(rChild instanceof SwiftParser.Explicit_member_expression_numberContext) {
            code = visitor.visitWithoutStrings(rChild, "?.");
            replaceWithSubscript = true;
        }
        else if(rChild instanceof SwiftParser.Explicit_member_expression_number_doubleContext) {
            String[] split = visitor.visit(rChild).split("\\.");
            int pos = 1, i = chainPos;
            while(i > 0 && chain.get(i - 1) instanceof SwiftParser.Explicit_member_expression_number_doubleContext) {i--; pos = pos == 1 ? 2 : 1;}
            code = split[pos].replaceAll("\\?", "");
            replaceWithSubscript = true;
        }
        else {
            code = visitor.visit(rChild);
        }

        if(lType != null && lType.definition instanceof EnumerationDefinition) {
            return Enumeration.getPrefixElem(rChild, functionCallParams, lType, null, visitor);
        }

        List<Instance> parameterTypes = FunctionUtil.parameterTypes(functionCallParams, visitor);
        String augment = null;
        boolean isInitializer = false;
        Cache.CacheBlockAndObject classDefinition = null;
        if(functionCallParams != null) {
            classDefinition = visitor.cache.find(code, rChild);
            isInitializer = lType == null && classDefinition != null && classDefinition.object instanceof ClassDefinition;
        }

        Map<String, Cache.CacheBlockAndObject> allProperties =
            isInitializer ? ((ClassDefinition)classDefinition.object).getAllProperties() :
            lType != null && lType.definition instanceof ClassDefinition ? ((ClassDefinition)lType.definition).getAllProperties() :
            visitor.cache.getAllTypes(rChild);

        if(functionCallParams != null) {
            if(parameterTypes != null) augment = FunctionUtil.augmentFromCall(code, parameterTypes, FunctionUtil.parameterExternalNames(functionCallParams, isSubscript), lType, isInitializer, allProperties);
            if(!isInitializer && augment != null) code += augment;
        }

        if(type == null) {
            String varName = code.trim();
            Cache.CacheBlockAndObject cacheBlockAndObject = null;
            Object/*Instance/Definition*/ instanceOrDefinition = null;
            if(lType == null) {
                if(varName.equals("self")) cacheBlockAndObject = visitor.cache.findNearestAncestorStructure(chain.get(0));
                else if(varName.equals("super")) cacheBlockAndObject = ((ClassDefinition)visitor.cache.findNearestAncestorStructure(chain.get(0)).object).superClass;
                else cacheBlockAndObject = visitor.cache.find(varName, chain.get(0));
                if(cacheBlockAndObject != null) instanceOrDefinition = cacheBlockAndObject.object;
            }
            else {
                instanceOrDefinition = lType.getProperty(varName);
            }
            if(instanceOrDefinition instanceof EnumerationDefinition && functionCallParams != null) {
                return Enumeration.getPrefixElemFromRawValue((EnumerationDefinition)instanceOrDefinition, functionCallParams, visitor);
            }
            if(instanceOrDefinition == null) {
                cacheBlockAndObject = FunctionUtil.findFirstMatching(varName, isInitializer, allProperties);
                if(cacheBlockAndObject != null) instanceOrDefinition = cacheBlockAndObject.object;
                if(lType != null && instanceOrDefinition instanceof Instance) instanceOrDefinition = lType.specifyGenerics((Instance)instanceOrDefinition);
            }

            if(augment == null && instanceOrDefinition instanceof FunctionDefinition) {
                code = ((FunctionDefinition)instanceOrDefinition).name;
            }
            else if(augment == null && instanceOrDefinition instanceof Instance && ((Instance)instanceOrDefinition).definition instanceof FunctionDefinition) {
                code = ((FunctionDefinition)((Instance)instanceOrDefinition).definition).name;
            }

            if(cacheBlockAndObject != null && Cache.isStructureBlock(cacheBlockAndObject.block)) {
                code = "this." + code;
            }
            else if(varName.equals("self")) {
                code = "this";
                instanceOrDefinition = new Instance((ClassDefinition)instanceOrDefinition);
            }
            else if(varName.equals("super")) {
                instanceOrDefinition = new Instance((ClassDefinition)instanceOrDefinition);
            }
            if(visitor.varNameReplacements != null) {
                int index = visitor.varNameReplacements.indexOf(varName);
                if(index >= 0) code = visitor.varNameReplacements.get(index + 1);
            }
            if(functionCallParams != null) {
                typeBeforeCall = instanceOrDefinition;
                if(instanceOrDefinition instanceof Definition) {
                    if(instanceOrDefinition instanceof FunctionDefinition) {
                        FunctionDefinition functionDefinition = (FunctionDefinition)instanceOrDefinition;
                        type = functionDefinition.result.withoutPropertyInfo();
                        if(type.definition == null && type.genericDefinition != null) {
                            for(int i = 0; i < parameterTypes.size() && i < functionDefinition.parameterTypes.size(); i++) {
                                if(functionDefinition.parameterTypes.get(i).genericDefinition != null && functionDefinition.parameterTypes.get(i).genericDefinition.equals(type.genericDefinition)) {
                                    type.definition = parameterTypes.get(i).definition;
                                    break;
                                }
                            }
                        }
                    }
                    else {
                        ClassDefinition initClass = (ClassDefinition)instanceOrDefinition;
                        type = new Instance(initClass);
                        if(!initClass.generics.isEmpty()) {
                            type.generics = new HashMap<String, Instance>();
                            List<Instance> initializerTypes = ((FunctionDefinition)initClass.properties.get("init" + augment).definition).parameterTypes;
                            for(int i = 0; i < initializerTypes.size(); i++) {
                                if(initializerTypes.get(i).definition == null && initializerTypes.get(i).genericDefinition != null && !type.generics.containsKey(initializerTypes.get(i).genericDefinition)) {
                                    type.generics.put(initializerTypes.get(i).genericDefinition, parameterTypes.get(i));
                                }
                            }
                        }
                    }
                }
                else {
                    type = ((Instance)instanceOrDefinition).result();
                }
            }
            else {
                if(instanceOrDefinition instanceof Definition) {
                    type = new Instance((Definition)instanceOrDefinition);
                }
                else type = (Instance)instanceOrDefinition;
            }
        }

        if(rChild instanceof SwiftParser.Primary_expressionContext && ((SwiftParser.Primary_expressionContext) rChild).generic_argument_clause() != null) {
            type.generics = new HashMap<String, Instance>();
            List<SwiftParser.Generic_argumentContext> genericCtxs = ((SwiftParser.Primary_expressionContext) rChild).generic_argument_clause().generic_argument_list().generic_argument();
            for(int i = 0; i < genericCtxs.size(); i++) {
                Instance genericInstance = new Instance(genericCtxs.get(i).type().type_identifier().getText(), rChild, visitor.cache);
                type.generics.put(type.definition.generics.get(i).name, genericInstance);
            }
        }

        if(isInitializer) {
            code += GenericUtil.targetType(type, visitor.targetLanguage);
        }

        if(functionCallParams != null) {
            functionCallParamsStr = getFunctionCallParamsStr(functionCallParams, type, typeBeforeCall, isInitializer, augment, visitor);
        }

        return new PrefixElem(code, isSubscript, replaceWithSubscript, type, functionCallParamsStr, typeBeforeCall, isInitializer ? augment : null);
    }

    static public List<String> getFunctionCallParamsStr(List<? extends ParserRuleContext> functionCallParams, Instance type, Object typeBeforeCall, boolean isInitializer, String augment, Visitor visitor) {
        List<String> functionCallParamsStr = new ArrayList<String>();
        for(int i = 0; i < functionCallParams.size(); i++) {
            String paramStr;
            if(functionCallParams.get(i) instanceof SwiftParser.Explicit_closure_expressionContext) {
                paramStr = FunctionUtil.explicitParamClosureExpression(type, typeBeforeCall, (SwiftParser.Explicit_closure_expressionContext) functionCallParams.get(i), i, visitor);
            }
            else {
                FunctionDefinition functionDefinition =
                    isInitializer ? (FunctionDefinition)type.getProperty("init" + augment).definition :
                    typeBeforeCall instanceof FunctionDefinition ? (FunctionDefinition)typeBeforeCall :
                    typeBeforeCall instanceof Instance ? (FunctionDefinition)((Instance)typeBeforeCall).definition :
                    null;
                Instance knownType = functionDefinition != null && functionDefinition.parameterTypes.size() >= i + 1 ? type.specifyGenerics(functionDefinition.parameterTypes.get(i).withoutPropertyInfo()) : null;
                paramStr = new Expression(functionCallParams.get(i) instanceof SwiftParser.Expression_elementContext ? ((SwiftParser.Expression_elementContext)functionCallParams.get(i)).expression() : (SwiftParser.ExpressionContext)functionCallParams.get(i), knownType, visitor).code;
            }
            functionCallParamsStr.add(paramStr);
        }
        return  functionCallParamsStr;
    }

    public Map<String, String> codeReplacement() {
        return (
            type.codeReplacement != null ? type.codeReplacement :
            typeBeforeCall instanceof Instance ? ((Instance) typeBeforeCall).codeReplacement :
            typeBeforeCall instanceof FunctionDefinition ? ((FunctionDefinition)typeBeforeCall).codeReplacement :
            initializerSignature != null ? type.getProperty("init" + initializerSignature).codeReplacement :
            null
        );
    }
}
