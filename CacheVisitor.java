import org.antlr.v4.runtime.ParserRuleContext;
import org.antlr.v4.runtime.RuleContext;
import org.antlr.v4.runtime.tree.ParseTree;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;

public class CacheVisitor extends Visitor {

    SwiftParser.Top_levelContext topLevel;

    public CacheVisitor(Cache cache, String targetLanguage, SwiftParser.Top_levelContext topLevel) {
        super();
        this.cache = cache;
        this.targetLanguage = targetLanguage;
        this.topLevel = topLevel;
    }

    @Override public String visitConstant_declaration(SwiftParser.Constant_declarationContext ctx) {
        visitPatternInitializers(ctx.constant_declaration_body().pattern_initializer_list().pattern_initializer(), ctx.constant_declaration_head().declaration_modifiers());
        return null;
    }
    @Override public String visitVariable_declaration(SwiftParser.Variable_declarationContext ctx) {
        if(ctx.variable_declaration_body().regular_variable_declaration() != null) {
            visitPatternInitializers(ctx.variable_declaration_body().regular_variable_declaration().pattern_initializer_list().pattern_initializer(), ctx.variable_declaration_head().declaration_modifiers());
        }
        else {
            visitPropertyDeclaration(ctx.variable_declaration_body().property_declaration(), ctx.variable_declaration_head().declaration_modifiers());
            visitChildren(ctx);
        }
        return null;
    }
    private void visitPatternInitializers(List<SwiftParser.Pattern_initializerContext> initializers, SwiftParser.Declaration_modifiersContext modifiers) {
        for(int i = 0; i < initializers.size(); i++) {
            visitPatternInitializer(initializers.get(i), modifiers);
        }
    }
    private void visitPatternInitializer(SwiftParser.Pattern_initializerContext ctx, SwiftParser.Declaration_modifiersContext modifiers) {
        String varName = ctx.pattern().identifier_pattern().getText();
        Instance varType =
                ctx.pattern().type_annotation() != null && ctx.pattern().type_annotation().type() != null ? TypeUtil.fromDefinition(ctx.pattern().type_annotation().type(), this)
                : TypeUtil.infer(ctx.initializer().expression(), this);
        addModifiers(varType, modifiers);
        cache(varName, varType, ctx);
        visitChildren(ctx.initializer());
    }
    private void visitPropertyDeclaration(SwiftParser.Property_declarationContext ctx, SwiftParser.Declaration_modifiersContext modifiers) {
        String varName = ctx.variable_name().getText();
        Instance varType = TypeUtil.fromDefinition(ctx.type_annotation().type(), this);
        addModifiers(varType, modifiers);
        cache(varName, varType, ctx);
        visit(ctx.property_declaration_body());
    }

    @Override public String visitProtocol_property_declaration(SwiftParser.Protocol_property_declarationContext ctx) {
        String varName = ctx.variable_name().getText();
        Instance varType = TypeUtil.fromDefinition(ctx.type_annotation().type(), this);
        cache(varName, varType, ctx);
        return null;
    }

    private void cache(String varName, Object/*Definition/Instance*/ varType, ParseTree ctx) {
        if(varType instanceof FunctionDefinition) varName += FunctionUtil.nameAugment(((FunctionDefinition)varType).parameterExternalNames, ((FunctionDefinition)varType).parameterTypes);
        cache.cacheOne(varName, varType, ctx);
    }

    @Override public String visitFunction_declaration(SwiftParser.Function_declarationContext ctx) {
        visitFunctionDeclaration(ctx, ctx.function_head().declaration_modifiers());
        return null;
    }
    @Override public String visitInitializer_declaration(SwiftParser.Initializer_declarationContext ctx) {
        visitFunctionDeclaration(ctx, ctx.initializer_head().declaration_modifiers());
        return null;
    }
    @Override public String visitProtocol_method_declaration(SwiftParser.Protocol_method_declarationContext ctx) {
        visitFunctionDeclaration(ctx, ctx.function_head().declaration_modifiers());
        return null;
    }
    @Override public String visitSubscript_declaration(SwiftParser.Subscript_declarationContext ctx) {
        visitFunctionDeclaration(ctx, ctx.subscript_head().declaration_modifiers());
        return null;
    }
    private void visitFunctionDeclaration(ParserRuleContext ctx, SwiftParser.Declaration_modifiersContext modifiers) {

        FunctionDefinition functionDefinition = new FunctionDefinition(ctx, this);
        Object cachedObject;
        if(Cache.isStructureBlock(cache.findNearestAncestorBlock(ctx))) {
            //it's actually method declaration
            Instance instance = new Instance(functionDefinition);
            addModifiers(instance, modifiers);
            cachedObject = instance;
        }
        else {
            cachedObject = functionDefinition;
        }
        cache.cacheOne(functionDefinition.name, cachedObject, ctx);

        List<SwiftParser.Code_blockContext> codeBlockCtxs = FunctionUtil.codeBlockCtxs(ctx);
        for(int j = 0; j < codeBlockCtxs.size(); j++) {
            ArrayList<String> parameterLocalNames = FunctionUtil.parameterLocalNames(FunctionUtil.parameters(ctx));
            for(int i = 0; i < parameterLocalNames.size(); i++) {
                cache.cacheOne(parameterLocalNames.get(i), functionDefinition.parameterTypes.get(i), codeBlockCtxs.get(j));
            }
            visit(codeBlockCtxs.get(j));
        }

        if(ctx instanceof SwiftParser.Subscript_declarationContext && codeBlockCtxs.size() == 2) {
            cache.cacheOne(AssignmentUtil.setterArgumentName((SwiftParser.Setter_clauseContext) codeBlockCtxs.get(1).parent), functionDefinition.result.withoutPropertyInfo(), codeBlockCtxs.get(1));
        }
    }

    private void addModifiers(Instance property, SwiftParser.Declaration_modifiersContext modifiers) {
        if(AssignmentUtil.modifiers(modifiers).contains("static")) property.isStatic = true;
    }

    public void visitExplicit_closure_expression(PrefixElem elem, SwiftParser.Explicit_closure_expressionContext ctx, int paramPos) {

        List<Instance> parameterTypes = FunctionUtil.closureParameterTypes(elem.type, elem.typeBeforeCall, paramPos);
        List<String> parameterNames = FunctionUtil.closureParameterNames(parameterTypes, ctx);

        for(int i = 0; i < parameterNames.size(); i++) cache.cacheOne(parameterNames.get(i), parameterTypes.get(i), ctx);
    }

    @Override public String visitSetter_clause(SwiftParser.Setter_clauseContext ctx) {
        this.visitPropertyClause(ctx);
        return null;
    }
    @Override public String visitWillSet_clause(SwiftParser.WillSet_clauseContext ctx) {
        this.visitPropertyClause(ctx);
        return null;
    }
    @Override public String visitDidSet_clause(SwiftParser.DidSet_clauseContext ctx) {
        this.visitPropertyClause(ctx);
        return null;
    }
    private void visitPropertyClause(ParserRuleContext ctx) {
        SwiftParser.Property_declarationContext propertyDeclaration = (SwiftParser.Property_declarationContext) ctx.parent.parent.parent;
        Instance propertyType = ((Instance)cache.find(propertyDeclaration.variable_name().getText(), ctx).object).withoutPropertyInfo();
        SwiftParser.Code_blockContext blockContext =
            ctx instanceof SwiftParser.Setter_clauseContext ? ((SwiftParser.Setter_clauseContext)ctx).code_block() :
            ctx instanceof SwiftParser.WillSet_clauseContext ? ((SwiftParser.WillSet_clauseContext)ctx).code_block() :
            ((SwiftParser.DidSet_clauseContext)ctx).code_block();
        String argumentName =
            ctx instanceof SwiftParser.Setter_clauseContext ? AssignmentUtil.setterArgumentName((SwiftParser.Setter_clauseContext) ctx) :
            ctx instanceof SwiftParser.WillSet_clauseContext ? AssignmentUtil.willSetArgumentName((SwiftParser.WillSet_clauseContext)ctx) :
            AssignmentUtil.didSetArgumentName((SwiftParser.DidSet_clauseContext)ctx);

        cache.cacheOne(argumentName, propertyType, blockContext);

        visit(blockContext);
    }

    @Override public String visitClass_declaration(SwiftParser.Class_declarationContext ctx) {
        visitClassOrStructOrProtocolDeclaration(ctx);
        return null;
    }
    @Override public String visitStruct_declaration(SwiftParser.Struct_declarationContext ctx) {
        visitClassOrStructOrProtocolDeclaration(ctx);
        return null;
    }
    @Override public String visitProtocol_declaration(SwiftParser.Protocol_declarationContext ctx) {
        visitClassOrStructOrProtocolDeclaration(ctx);
        return null;
    }
    private void visitClassOrStructOrProtocolDeclaration(ParserRuleContext ctx) {
        int type = ctx instanceof SwiftParser.Class_declarationContext ? 0 : ctx instanceof SwiftParser.Struct_declarationContext ? 1 : 2;

        String name = Cache.structureName(ctx);

        Cache.CacheBlockAndObject superClass = null;
        List<ClassDefinition> protocols = new ArrayList<ClassDefinition>();
        SwiftParser.Type_inheritance_clauseContext typeInheritanceClauseCtx =
                type == 0 ? ((SwiftParser.Class_declarationContext)ctx).type_inheritance_clause() :
                type == 1 ? ((SwiftParser.Struct_declarationContext)ctx).type_inheritance_clause() :
                ((SwiftParser.Protocol_declarationContext)ctx).type_inheritance_clause();
        if(typeInheritanceClauseCtx != null) {
            SwiftParser.Type_inheritance_listContext typeInheritanceListCtx = typeInheritanceClauseCtx.type_inheritance_list();
            while(typeInheritanceListCtx != null) {
                String inheritedName = typeInheritanceListCtx.type_identifier().getText();
                Cache.CacheBlockAndObject inheritedDefinition = cache.find(inheritedName, ctx);
                if(type != 2 && ((ClassDefinition)inheritedDefinition.object).isProtocol) {
                    protocols.add((ClassDefinition)inheritedDefinition.object);
                }
                else {
                    superClass = inheritedDefinition;
                }
                typeInheritanceListCtx = typeInheritanceListCtx.type_inheritance_list();
            }
        }

        SwiftParser.Generic_parameter_clauseContext genericParameterClauseCtx =
            type == 0 ? ((SwiftParser.Class_declarationContext)ctx).generic_parameter_clause() :
            type == 1 ? ((SwiftParser.Struct_declarationContext)ctx).generic_parameter_clause() :
            null;
        List<Generic> generics = GenericUtil.fromParameterClause(genericParameterClauseCtx, this);

        ClassDefinition classDefinition = new ClassDefinition(name, superClass, new LinkedHashMap<String, Instance>(), generics, type == 2, protocols);
        if(ctx instanceof SwiftParser.Struct_declarationContext) {
            classDefinition.cloneOnAssignmentReplacement = new HashMap<String, Boolean>();
            classDefinition.cloneOnAssignmentReplacement.put("ts", true);
            classDefinition.cloneOnAssignmentReplacement.put("java", true);
        }
        cache.cacheOne(name, classDefinition, ctx);

        visit(
                type == 0 ? ((SwiftParser.Class_declarationContext) ctx).class_body() :
                type == 1 ? ((SwiftParser.Struct_declarationContext) ctx).struct_body() :
                ((SwiftParser.Protocol_declarationContext) ctx).protocol_body()
        );

        if(type == 1) Initializer.addMemberwiseInitializer(classDefinition, ctx, this);
        Initializer.addDefaultInitializer(classDefinition, ctx, this);
    }

    @Override public String visitFor_in_statement(SwiftParser.For_in_statementContext ctx) {

        if(ctx.expression() != null && ctx.expression().binary_expressions() != null) {
            String varName = ctx.pattern().getText().equals("_") ? "$" : ctx.pattern().getText();
            cache.cacheOne(varName, new Instance("Int", ctx, cache), ctx.code_block());
        }
        else {
            Instance iteratedType = new Expression(ctx.expression(), null, this).type;
            String indexVar = "$", valueVar;
            if(ctx.pattern().tuple_pattern() != null) {
                indexVar = ctx.pattern().tuple_pattern().tuple_pattern_element_list().tuple_pattern_element(0).getText();
                valueVar = ctx.pattern().tuple_pattern().tuple_pattern_element_list().tuple_pattern_element(1).getText();
            }
            else {
                valueVar = ctx.pattern().identifier_pattern().getText();
            }
            cache.cacheOne(indexVar, iteratedType.typeName() != null && iteratedType.typeName().equals("Dictionary") ? iteratedType.generics.get("Key") : new Instance("Int", ctx, cache), ctx.code_block());
            cache.cacheOne(valueVar, iteratedType.typeName() != null && iteratedType.typeName().equals("String") ? new Instance("String", ctx, cache) : iteratedType.generics.get("Value"), ctx.code_block());
        }

        visit(ctx.code_block());

        return null;
    }

    private void cacheIfLet(ParserRuleContext ctx, SwiftParser.Code_blockContext codeBlock) {
        IfLet ifLet = new IfLet(ctx, this);
        for(int i = 0; i < ifLet.varNames.size(); i++) {
            cache.cacheOne(ifLet.varNames.get(i), ifLet.varTypes.get(i), codeBlock);
        }
        visit(codeBlock);
    }

    @Override public String visitIf_statement(SwiftParser.If_statementContext ctx) {
        cacheIfLet(ctx, ctx.code_block());
        if(ctx.else_clause() != null) visit(ctx.else_clause());
        return null;
    }

    @Override public String visitGuard_statement(SwiftParser.Guard_statementContext ctx) {
        cacheIfLet(ctx, ctx.code_block());
        return null;
    }

    @Override public String visitSwitch_case(SwiftParser.Switch_caseContext ctx) {
        List<String> valueBindingNames = new ArrayList<String>();
        List<String> valueBindingExpressions = new ArrayList<String>();
        List<Instance> valueBindingTypes = new ArrayList<Instance>();
        RuleContext parent = ctx;
        while(parent != null && !(parent instanceof SwiftParser.Switch_statementContext)) parent = parent.parent;
        ControlFlow.switchCondition(TypeUtil.infer(((SwiftParser.Switch_statementContext) parent).expression(), this), ctx, valueBindingNames, valueBindingExpressions, valueBindingTypes, this);
        for(int v = 0; v < valueBindingNames.size(); v++) {
            cache.cacheOne(valueBindingNames.get(v), valueBindingTypes.get(v), ctx);
        }
        return null;
    }

    @Override public String visitEnum_declaration(SwiftParser.Enum_declarationContext ctx) {
        Enumeration.cacheDeclaration(ctx, this);
        return null;
    }

    @Override public String visitOperator_declaration(SwiftParser.Operator_declarationContext ctx) {
        String operatorStr = ctx.infix_operator_declaration() != null ? ctx.infix_operator_declaration().operator().getText() : ctx.prefix_operator_declaration() != null ? ctx.prefix_operator_declaration().operator().getText() : ctx.postfix_operator_declaration().operator().getText();
        String word = "";
        for(int i = 0; i < operatorStr.length(); i++) {
            word += "_" + ((int)operatorStr.charAt(i));
        }

        Operator operator = new Operator();
        operator.word = word;
        if(ctx.infix_operator_declaration() != null) {
            String precedenceGroup = ctx.infix_operator_declaration().infix_operator_precedence_clause() != null ? ctx.infix_operator_declaration().infix_operator_precedence_clause().identifier().getText() : "DefaultCustomPrecedence";
            operator.precedenceGroup = (PrecedenceGroup)cache.find(precedenceGroup, ctx).object;
        }

        cache.cacheOne(operatorStr, operator, this.topLevel);

        return null;
    }

    @Override public String visitTypealias_declaration(SwiftParser.Typealias_declarationContext ctx) {
        cache.cacheOne(ctx.typealias_head().typealias_name().getText(), TypeUtil.fromDefinition(ctx.typealias_assignment().type(), this).definition, ctx);
        return null;
    }
}
