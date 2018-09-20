import org.antlr.v4.runtime.ParserRuleContext;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class FunctionUtil {

    static public List<SwiftParser.ParameterContext> parameters(ParserRuleContext ctx) {
        SwiftParser.Parameter_listContext parameterList = FunctionUtil.parameterList(ctx);
        return parameterList != null ? parameterList.parameter() : new ArrayList<SwiftParser.ParameterContext>();
    }

    static public ArrayList<String> parameterExternalNames(List<?extends ParserRuleContext> parameters, boolean isSubscript) {
        ArrayList<String> names = new ArrayList<String>();
        for(int i = 0; parameters != null && i < parameters.size(); i++) names.add(parameterExternalName(parameters.get(i), isSubscript));
        return names;
    }
    static private String parameterExternalName(ParserRuleContext parameter, boolean isSubscript) {
        if(isSubscript) return "";
        if(parameter instanceof SwiftParser.ParameterContext) {
            if(((SwiftParser.ParameterContext)parameter).external_parameter_name() != null) {
                if(((SwiftParser.ParameterContext)parameter).external_parameter_name().getText().equals("_")) return "";
                else return ((SwiftParser.ParameterContext)parameter).external_parameter_name().getText();
            }
        }
        return parameterLocalName(parameter);
    }

    static public ArrayList<String> parameterLocalNames(List<SwiftParser.ParameterContext> parameters) {
        ArrayList<String> names = new ArrayList<String>();
        for(int i = 0; parameters != null && i < parameters.size(); i++) names.add(parameterLocalName(parameters.get(i)));
        return names;
    }
    static private String parameterLocalName(ParserRuleContext parameter) {
        if(parameter instanceof SwiftParser.ParameterContext) {
            return ((SwiftParser.ParameterContext)parameter).local_parameter_name().getText();
        }
        if(parameter instanceof SwiftParser.Expression_elementContext) {
            if(((SwiftParser.Expression_elementContext)parameter).identifier() != null) return ((SwiftParser.Expression_elementContext)parameter).identifier().getText();
            return "";
        }
        return "";
    }

    static public String nameAugment(List<String> parameterExternalNames, List<Instance> parameterTypes) {
        String augment = "";
        for(int i = 0; i < parameterTypes.size(); i++) {
            augment += "$" + parameterExternalNames.get(i) + "_" + parameterTypes.get(i).uniqueId();
        }
        return augment;
    }

    static public ArrayList<Instance> parameterTypes(List<?extends ParserRuleContext> parameters, Visitor visitor) {
        ArrayList<Instance> parameterTypes = new ArrayList<Instance>();
        if(parameters == null) return parameterTypes;

        for(int i = 0; i < parameters.size(); i++) {
            ParserRuleContext parameter = parameters.get(i);
            Instance parameterType;
            if(parameter instanceof SwiftParser.ParameterContext && ((SwiftParser.ParameterContext)parameter).type_annotation() != null) {
                parameterType = TypeUtil.fromDefinition(((SwiftParser.ParameterContext) parameter).type_annotation().type(), visitor);
            }
            else if(parameter instanceof SwiftParser.Explicit_closure_expressionContext) {
                parameterType = null;
            }
            else if(parameter instanceof SwiftParser.Expression_elementContext && WalkerUtil.isDirectDescendant(SwiftParser.Closure_expressionContext.class, ((SwiftParser.Expression_elementContext) parameter).expression())) {
                parameterType = null;
            }
            else {
                parameterType = TypeUtil.infer(parameter instanceof SwiftParser.ParameterContext ? ((SwiftParser.ParameterContext) parameter).default_argument_clause().expression() : parameter instanceof SwiftParser.Expression_elementContext ? ((SwiftParser.Expression_elementContext) parameter).expression() : (SwiftParser.ExpressionContext) parameter, visitor);
            }
            if(parameterType == null) return null;
            parameterTypes.add(parameterType);
        }
        return parameterTypes;
    }

    static public int numParametersWithDefaultValue(List<SwiftParser.ParameterContext> parameters) {
        if(parameters == null) return 0;

        int numParametersWithDefaultValue = 0;
        for(int i = parameters.size() - 1; i >= 0; i--) {
            SwiftParser.ParameterContext parameter = parameters.get(i);
            if(parameter.default_argument_clause() == null) break;
            numParametersWithDefaultValue++;
        }
        return numParametersWithDefaultValue;
    }

    static public Map<String, Cache.CacheBlockAndObject> getFunctionTypesStartingWith(String varName, Map<String, Cache.CacheBlockAndObject> allProperties) {
        Map<String, Cache.CacheBlockAndObject> matches = new HashMap<String, Cache.CacheBlockAndObject>();
        varName = varName.trim();

        if(allProperties != null) {
            for(Map.Entry<String, Cache.CacheBlockAndObject> iterator:allProperties.entrySet()) {
                boolean passes = (
                        (iterator.getValue().object instanceof Instance && ((Instance) iterator.getValue().object).definition instanceof FunctionDefinition) ||
                                iterator.getValue().object instanceof FunctionDefinition
                ) && functionStartsWith(iterator.getKey(), varName);
                if(passes) {
                    matches.put(iterator.getKey(), iterator.getValue());
                }
            }
        }

        return matches;
    }

    static public Cache.CacheBlockAndObject findFirstMatching(String swiftFunctionName, boolean isInitializer, Map<String, Cache.CacheBlockAndObject> allProperties) {
        String defaultFunctionName = isInitializer ? "init" : swiftFunctionName;
        Map<String, Cache.CacheBlockAndObject> candidates = getFunctionTypesStartingWith(defaultFunctionName, allProperties);
        return candidates.get((new ArrayList<String>(candidates.keySet())).get(0));
    }

    static public String augmentFromCall(String swiftFunctionName, List<Instance> parameterTypes, List<String> parameterExternalNames, Instance lType, boolean isInitializer, Map<String, Cache.CacheBlockAndObject> allProperties) {

        String defaultFunctionName = isInitializer ? "init" : swiftFunctionName;

        Map<String, Cache.CacheBlockAndObject> candidates = getFunctionTypesStartingWith(defaultFunctionName, allProperties);
        for(Map.Entry<String, Cache.CacheBlockAndObject> iterator:candidates.entrySet()) {
            FunctionDefinition functionType =
                iterator.getValue().object instanceof FunctionDefinition ? (FunctionDefinition)iterator.getValue().object :
                (FunctionDefinition)((Instance)iterator.getValue().object).definition;
            boolean parametersMatch = true;
            Instance lastParameterType = functionType.parameterTypes.size() > 0 ? functionType.parameterTypes.get(functionType.parameterTypes.size() - 1) : null;
            for(int i = 0; i < parameterTypes.size() && parametersMatch; i++) {
                Instance expectedParameterType;
                String expectedParameterExternalName;
                if(lastParameterType != null && lastParameterType.isVariadicParameter && i >= functionType.parameterTypes.size() - 1) {
                    expectedParameterType = lastParameterType.generics.get("Value");
                    expectedParameterExternalName = "";
                }
                else {
                    if(i >= functionType.parameterExternalNames.size()){ parametersMatch = false; break; }
                    expectedParameterExternalName = functionType.parameterExternalNames.get(i);
                    expectedParameterType = functionType.parameterTypes.get(i);
                }
                if(lType != null) expectedParameterType = lType.specifyGenerics(expectedParameterType);
                if(!expectedParameterExternalName.equals(parameterExternalNames.get(i))) { parametersMatch = false; break; }
                if(isInitializer && expectedParameterType.definition == null && expectedParameterType.genericDefinition != null/* TODO && genericsNotYetSpecified*/) {}
                else if(parameterTypes.get(i) != null && !TypeUtil.conformsToType(parameterTypes.get(i), expectedParameterType)){ parametersMatch = false; break; }
            }
            if(!parametersMatch) continue;
            if(parameterTypes.size() >= functionType.parameterTypes.size() - functionType.numParametersWithDefaultValue) return iterator.getKey().substring(defaultFunctionName.length());
        }

        return null;
    }

    static public boolean functionStartsWith(String name, String varName) {
        return name.startsWith(varName) && (name.length() == varName.length() || name.startsWith(varName + "$"));
    }

    static public String functionDeclaration(ParserRuleContext ctx, SwiftParser.Declaration_modifiersContext modifiers, Visitor visitor) {
        FunctionDefinition functionDefinition = new FunctionDefinition(ctx, visitor);
        boolean isInClass = ctx.parent != null && (ctx.parent.parent instanceof SwiftParser.DeclarationsContext || ctx.parent.parent instanceof SwiftParser.Protocol_member_declarationsContext);
        SwiftParser.Generic_parameter_clauseContext genericParameterClauseCtx = GenericUtil.genericParameterClauseCtxFromFunction(ctx);
        boolean isSubscript = ctx instanceof SwiftParser.Subscript_declarationContext;

        String code = "";
        List<SwiftParser.Code_blockContext> codeBlockCtxs = FunctionUtil.codeBlockCtxs(ctx);
        for(int j = 0; j < codeBlockCtxs.size(); j++) {
            code += (
                (AssignmentUtil.modifiers(modifiers).contains("static") ? "static " : "") +
                (!isInClass ? "function " : "") +
                functionDefinition.name + (isSubscript ? j == 0 ? "$get" : "$set" : "") +
                (genericParameterClauseCtx != null ? visitor.visit(genericParameterClauseCtx) : "") +
                "(" +
                visitor.visitChildren(parameterList(ctx)) +
                (isSubscript && j == 1 ? ", " + AssignmentUtil.setterArgumentName((SwiftParser.Setter_clauseContext) codeBlockCtxs.get(1).parent) + ": " + functionDefinition.result.targetType(visitor.targetLanguage) : "") +
                "):" +
                functionDefinition.result.targetType(visitor.targetLanguage) +
                visitor.visit(codeBlockCtxs.get(j))
            );
        }

        return code;
    }

    static public String closureExpression(SwiftParser.Closure_expressionContext ctx, Instance type, List<? extends ParserRuleContext/*Expression_elementContext or Closure_expressionContext*/> functionCallParams, Visitor visitor) {
        String closureExpression = "";
        if(ctx.operator() != null) {
            closureExpression = "(a, b) => a " + ctx.operator().getText() + " b";
        }
        else if(ctx.explicit_closure_expression() != null) {
            closureExpression = explicitClosureExpression("", ctx.explicit_closure_expression(), visitor);
        }
        if(functionCallParams != null) {
            closureExpression = "(" + closureExpression + ")(";
            for(int i = 0; i < functionCallParams.size(); i++) {
                closureExpression += (i > 0 ? ", " : "") + visitor.visit(functionCallParams.get(i));
            }
            closureExpression += ")";
        }
        return closureExpression;
    }

    static public String explicitParamClosureExpression(Instance elemType, Object elemTypeBeforeCallParams, SwiftParser.Explicit_closure_expressionContext ctx, int paramPos, Visitor visitor) {

        List<Instance> parameterTypes = FunctionUtil.closureParameterTypes(elemType, elemTypeBeforeCallParams, paramPos);
        List<String> parameterNames = FunctionUtil.closureParameterNames(parameterTypes, ctx);
        String parameterStr = "";
        for(int i = 0; i < parameterNames.size(); i++) parameterStr += (i > 0 ? ", " : "") + parameterNames.get(i) + ": " + parameterTypes.get(i).targetType(visitor.targetLanguage);

        return explicitClosureExpression(parameterStr, ctx, visitor);
    }
    static private String explicitClosureExpression(String parameterStr, SwiftParser.Explicit_closure_expressionContext ctx, Visitor visitor) {

        SwiftParser.StatementsContext statements = ctx.statements();

        return
            "(" + parameterStr + ") => " + (
                statements == null || statements.getChildCount() == 0 ? "{}" :
                statements.getChildCount() == 1 ? visitor.visitChildren(statements) :
                "{" + visitor.visitChildren(statements) + "}"
            );
    }

    static public List<Instance> closureParameterTypes(Instance elemType, Object elemTypeBeforeCallParams, int paramPos) {
        FunctionDefinition functionDefinition = (FunctionDefinition)((FunctionDefinition) ((Instance) elemTypeBeforeCallParams).definition).parameterTypes.get(paramPos).definition;

        List<Instance> parameterTypes = new ArrayList<Instance>();
        for(int i = 0; i < functionDefinition.parameterTypes.size(); i++) {
            parameterTypes.add(elemType.specifyGenerics(functionDefinition.parameterTypes.get(i)));
        }
        return parameterTypes;
    }
    static public List<String> closureParameterNames(List<Instance> parameterTypes, SwiftParser.Explicit_closure_expressionContext ctx) {
        List<String> parameterNames = new ArrayList<String>();
        if(ctx.closure_signature() != null) {
            List<SwiftParser.IdentifierContext> identifiers = ctx.closure_signature().identifier_list().identifier();
            for(int i = 0; i < identifiers.size(); i++) parameterNames.add(identifiers.get(i).getText());
        }
        else {
            for(int i = 0; i < parameterTypes.size(); i++) parameterNames.add("$" + i);
        }
        return parameterNames;
    }

    static public List<SwiftParser.Code_blockContext> codeBlockCtxs(ParserRuleContext ctx) {
        List<SwiftParser.Code_blockContext> codeBlockCtxs = new ArrayList<SwiftParser.Code_blockContext>();
        if(ctx instanceof SwiftParser.Function_declarationContext) codeBlockCtxs.add(((SwiftParser.Function_declarationContext)ctx).function_body().code_block());
        else if(ctx instanceof SwiftParser.Initializer_declarationContext) codeBlockCtxs.add(((SwiftParser.Initializer_declarationContext)ctx).initializer_body().code_block());
        else if(ctx instanceof SwiftParser.Subscript_declarationContext) {
            if(((SwiftParser.Subscript_declarationContext) ctx).code_block() != null) {
                codeBlockCtxs.add(((SwiftParser.Subscript_declarationContext) ctx).code_block());
            }
            else {
                codeBlockCtxs.add(((SwiftParser.Subscript_declarationContext) ctx).getter_setter_block().getter_clause().code_block());
                if(((SwiftParser.Subscript_declarationContext) ctx).getter_setter_block().setter_clause() != null) codeBlockCtxs.add(((SwiftParser.Subscript_declarationContext) ctx).getter_setter_block().setter_clause().code_block());
            }
        }
        return codeBlockCtxs;
    }
    static public SwiftParser.Parameter_listContext parameterList(ParserRuleContext ctx) {
        return ctx instanceof SwiftParser.Function_declarationContext ? ((SwiftParser.Function_declarationContext)ctx).function_signature().parameter_clauses().parameter_clause().parameter_list() :
               ctx instanceof SwiftParser.Initializer_declarationContext ? ((SwiftParser.Initializer_declarationContext)ctx).parameter_clause().parameter_list() :
               ctx instanceof SwiftParser.Subscript_declarationContext ? ((SwiftParser.Subscript_declarationContext)ctx).subscript_head().parameter_clause().parameter_list() :
               ((SwiftParser.Protocol_method_declarationContext)ctx).function_signature().parameter_clauses().parameter_clause().parameter_list();
    }
}
