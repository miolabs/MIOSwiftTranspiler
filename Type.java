import org.antlr.v4.runtime.tree.ParseTree;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;

class PrecedenceGroup {
    public boolean leftAssociativity;
}

class Operator {
    public PrecedenceGroup precedenceGroup;
    public String word;
    public Definition result;
    public Map<String, String> codeReplacementPrefix;
    public Map<String, String> codeReplacementInfix;
    public Map<String, String> codeReplacementPostfix;
}

class Generics {
    public List<String> names;
    public Map<String, TypeConstraint> typeConstraints;//generic/associatedtype name -> list of protocols/classes
    public Generics() { this.names = new ArrayList<String>(); this.typeConstraints = new HashMap<String, TypeConstraint>(); }
    public Generics(List<String> names, Map<String, TypeConstraint> typeConstraints) { this.names = names; this.typeConstraints = typeConstraints; }
}
class TypeConstraint {
    //either a protocol if "<Generic: Protocol>"/"where Ass: Protocol" or a class if "where Ass == Class"
    public List<ClassDefinition> constraints;
    public Map<String, TypeConstraint> childAssociatedtypeConstraints;
    public TypeConstraint(List<ClassDefinition> constraints, Map<String, TypeConstraint> childAssociatedtypeConstraints) { this.constraints = constraints; this.childAssociatedtypeConstraints = childAssociatedtypeConstraints; }
}

abstract class Definition {
    public String name;
    //in each inheritance, there can be additional typeConstraints for associatedtype
    //we could redeclare the associatedtype, but that might get in the way of extension when we want to amend typeConstraints higher up
    //for associated we need to compute typeConstraints within the scope of a given Definition
    //since there can be additional typeConstraints further down the inheritance chain
    //TODO can relate only to some functions (extension) - maybe the answer is to define constraints at the point of those functions?
    public Generics generics;//generic/associatedtype name -> list of protocols/classes
    public Map<String, Boolean> cloneOnAssignmentReplacement;//ts->boolean, java->boolean
}

class ClassDefinition extends Definition {
    public Map<String, String> typeReplacement;//ts, java, javaProtocol(e.g. Map for HashMap) -- string with generics
    public Cache.CacheBlockAndObject superClass;
    public Map<String, Instance> properties;
    boolean isProtocol;
    public List<ClassDefinition> protocols;
    public ClassDefinition(String name, Cache.CacheBlockAndObject superClass, Map<String, Instance> properties, Generics generics, boolean isProtocol, List<ClassDefinition> protocols){ this.name = name; this.superClass = superClass; this.properties = properties; this.generics = generics; this.isProtocol = isProtocol; this.protocols = protocols; }
    public Map<String, Cache.CacheBlockAndObject> getAllProperties() {
        Map<String, Cache.CacheBlockAndObject> allProperties = new HashMap<String, Cache.CacheBlockAndObject>();
        ClassDefinition classDefinition = this;
        while(classDefinition != null) {
            for(Map.Entry<String, Instance> iterator:properties.entrySet()) {
                if(!allProperties.containsKey(iterator.getKey())) {
                    allProperties.put(iterator.getKey(), new Cache.CacheBlockAndObject(null, iterator.getValue()));
                }
            }
            Cache.CacheBlockAndObject superClass = classDefinition.superClass;
            classDefinition = superClass != null ? (ClassDefinition)superClass.object : null;
        }
        return allProperties;
    }
}

class FunctionDefinition extends Definition {
    public List<String> parameterExternalNames;
    public List<Instance> parameterTypes;
    public int numParametersWithDefaultValue = 0;
    public int operator = 0;//1: infix, 2: prefix, 3: postfix
    public Instance result;
    public Map<String, String> codeReplacement;//ts->tsCode, java->javaCode; if you can, rather keep it in Property, but sometimes needed for top-level funcs
    public FunctionDefinition(String name, List<String> parameterExternalNames, List<Instance> parameterTypes, int numParametersWithDefaultValue, Instance result, Generics generics){ this.name = name; this.parameterExternalNames = parameterExternalNames; this.parameterTypes = parameterTypes; this.numParametersWithDefaultValue = numParametersWithDefaultValue; this.result = result; this.generics = generics; }
    public FunctionDefinition(ParseTree ctx, Visitor visitor) {
        //TODO move to FunctionUtil

        this.generics = GenericUtil.fromParameterClause(GenericUtil.genericParameterClauseCtxFromFunction(ctx), visitor);

        List<SwiftParser.ParameterContext> parameters = FunctionUtil.parameters(ctx);

        this.parameterExternalNames = FunctionUtil.parameterExternalNames(parameters, ctx instanceof SwiftParser.Subscript_declarationContext);
        this.parameterTypes = FunctionUtil.parameterTypes(parameters, visitor);
        this.numParametersWithDefaultValue = FunctionUtil.numParametersWithDefaultValue(parameters);

        String baseName =
            ctx instanceof SwiftParser.Function_declarationContext ? ((SwiftParser.Function_declarationContext)ctx).function_name().getText() :
            ctx instanceof SwiftParser.Protocol_method_declarationContext ? ((SwiftParser.Protocol_method_declarationContext)ctx).function_name().getText() :
            ctx instanceof SwiftParser.Subscript_declarationContext || ctx instanceof SwiftParser.Protocol_subscript_declarationContext ? "OP_subscript" :
            "init";

        Cache.CacheBlockAndObject operator = visitor.cache.find(baseName, ctx);
        if(operator != null && operator.object instanceof Operator) {
            SwiftParser.Declaration_modifiersContext modifiers =
                ctx instanceof SwiftParser.Function_declarationContext ? ((SwiftParser.Function_declarationContext) ctx).function_head().declaration_modifiers() :
                ctx instanceof SwiftParser.Protocol_method_declarationContext ? ((SwiftParser.Protocol_method_declarationContext) ctx).function_head().declaration_modifiers() :
                ctx instanceof SwiftParser.Protocol_subscript_declarationContext ? ((SwiftParser.Protocol_subscript_declarationContext) ctx).subscript_head().declaration_modifiers() :
                ctx instanceof SwiftParser.Subscript_declarationContext ? ((SwiftParser.Subscript_declarationContext) ctx).subscript_head().declaration_modifiers() :
                null;
            if(AssignmentUtil.modifiers(modifiers).contains("prefix")) this.operator = 2;
            else if(AssignmentUtil.modifiers(modifiers).contains("postfix")) this.operator = 3;
            else this.operator = 1;
            baseName = "OP_" + ((Operator)operator.object).word + (this.operator == 2 ? "_PREFIX" : this.operator == 3 ? "_POSTFIX" : "");
            for(int i = 0; i < parameterExternalNames.size(); i++) {
                parameterExternalNames.set(i, "");
            }
        }
        this.name = baseName + FunctionUtil.nameAugment(parameterExternalNames, parameterTypes);

        this.result =
            ctx instanceof SwiftParser.Function_declarationContext ? TypeUtil.fromFunction(((SwiftParser.Function_declarationContext) ctx).function_signature().function_result(), null, false, ctx, visitor) :
            ctx instanceof SwiftParser.Protocol_method_declarationContext ? TypeUtil.fromFunction(((SwiftParser.Protocol_method_declarationContext) ctx).function_signature().function_result(), null, false, ctx, visitor) :
            ctx instanceof SwiftParser.Protocol_subscript_declarationContext ? TypeUtil.fromFunction(((SwiftParser.Protocol_subscript_declarationContext) ctx).function_result(), null, false, ctx, visitor) :
            ctx instanceof SwiftParser.Subscript_declarationContext ? TypeUtil.fromFunction(((SwiftParser.Subscript_declarationContext) ctx).function_result(), null, false, ctx, visitor) :
            new Instance("Void", ctx, visitor.cache);
    }
}

class EnumerationDefinition extends Definition {
    public Instance rawType;
    public HashMap<String, String> rawValues;
    public HashMap<String, Instance> tupleTypes;
    public EnumerationDefinition(String name, Instance rawType, HashMap<String, String> rawValues, HashMap<String, Instance> tupleTypes) { this.name = name; this.rawType = rawType; this.rawValues = rawValues; this.tupleTypes = tupleTypes; }
}

class Instance {
    public Definition definition;
    public String genericDefinition;
    //declaration modifiers
    public boolean isOptional = false;
    public boolean isInout = false;
    public boolean isVariadicParameter = false;
    public String enumerationDefinition = null;
    //class property modifiers
    public boolean isStatic = false;
    public boolean isOperator = false;
    public boolean isInitializer = false;
    public boolean isDefaultInitializer = false;
    public boolean isMemberwiseInitializer = false;
    public boolean isFailableInitializer = false;
    public boolean isGetterSetter = false;
    public Map<String, String> codeReplacement;//ts->tsCode, java->javaCode
    public Map<String, Instance> generics;
    //utils
    public String typeName() {
        //just definition name, e.g. dictionary
        return definition != null ? definition.name : genericDefinition;
    }
    public String uniqueId() {
        //something that will allow us to uniquely identify type, e.g. to figure out which overloaded function to use
        //TODO include scope if it's a name that's duplicated in the code
        //TODO include generic types; see parameter-overload-generic.swift
        return definition instanceof ClassDefinition ? definition.name != null ? definition.name : "any" : genericDefinition != null ? genericDefinition : "any";
    }
    public Instance withoutPropertyInfo() {
        Instance instance = new Instance(this.definition, this.genericDefinition, this.generics);
        instance.isOptional = isOptional;
        instance.enumerationDefinition = enumerationDefinition;
        return instance;
    }
    public String targetType(String language) { return targetType(language, false, false); }
    public String targetType(String language, boolean notProtocol, boolean baseIfInout) {
        if(definition == null) return genericDefinition;
        String type = definition.name;
        if(definition instanceof ClassDefinition) {
            ClassDefinition classDefinition = (ClassDefinition)definition;
            while(classDefinition != null) {
                if(classDefinition.typeReplacement != null && classDefinition.typeReplacement.containsKey(language)) {
                    if(language.equals("java") && !notProtocol && classDefinition.typeReplacement.containsKey(language + "Protocol")) type = classDefinition.typeReplacement.get(language + "Protocol");
                    else type = classDefinition.typeReplacement.get(language);
                    if(generics != null) {
                        for(String key : generics.keySet()) type = type.replaceAll("#" + key, Matcher.quoteReplacement(generics.get(key).targetType(language, false, true)));
                    }
                    break;
                }
                Cache.CacheBlockAndObject superClass = classDefinition.superClass;
                classDefinition = superClass != null ? (ClassDefinition)superClass.object : null;
            }
        }
        if(type == null) type = "any";
        type += GenericUtil.targetType(this, language);
        if(!isInout || baseIfInout) return type;
        return "{get: () => " + type + ", set: (val: " + type + ") => void}";
    }
    public Instance getProperty(String name, ParseTree ctx, Visitor visitor) {

        List<ClassDefinition> classDefinitions = new ArrayList<ClassDefinition>();
        if(definition != null) {
            classDefinitions.add((ClassDefinition)definition);
        }
        else {
            //we need to check what the current scope is, get the surrounding function/class definition (iterate through scopes)
            ParseTree foundCtx = ctx;
            Definition definitionWhereGeneric = null;
            do {
                Cache.CacheBlockAndObject definition = visitor.cache.findNearestAncestorStructureOrFunction(foundCtx, visitor);
                if(definition == null) {
                    foundCtx = null;
                }
                else {
                    foundCtx = definition.block;
                    for(String generic : ((Definition)definition.object).generics.names) {
                        if(generic.equals(genericDefinition)) {
                            definitionWhereGeneric = (Definition)definition.object;
                            break;
                        }
                    }
                }
            } while (definitionWhereGeneric == null && foundCtx != null);
            //go through definition's parents to work out associatedtypeAdditionalTypeConstraints
            //then iterate through these to find a matching property
            do {
                if(definitionWhereGeneric.generics.typeConstraints.containsKey(genericDefinition)) {
                    //TODO handle childAssociatedtypeConstraints here as well
                    classDefinitions.addAll(definitionWhereGeneric.generics.typeConstraints.get(genericDefinition).constraints);
                }
                if(definitionWhereGeneric instanceof ClassDefinition && ((ClassDefinition) definitionWhereGeneric).superClass != null) {
                    definitionWhereGeneric = (Definition)((ClassDefinition) definitionWhereGeneric).superClass.object;
                }
                else {
                    definitionWhereGeneric = null;
                }
            } while(definitionWhereGeneric != null);
        }

        for(ClassDefinition classDefinition : classDefinitions) {
            Instance property;
            do {
                property = classDefinition.properties.get(name);
                classDefinition = classDefinition.superClass != null ? (ClassDefinition)classDefinition.superClass.object : null;
            } while(property == null && classDefinition != null);
            if(property != null) return specifyGenerics(property);
        }
        return null;
    }
    public Instance result() {
        Instance result = ((FunctionDefinition)definition).result;
        return specifyGenerics(result);
    }
    public Instance specifyGenerics(Instance instance) {
        if(instance.definition == null) {
            if(generics != null && generics.containsKey(instance.genericDefinition)) {
                instance.definition = generics.get(instance.genericDefinition).definition;
                instance.generics = generics.get(instance.genericDefinition).generics;
            }
        }
        else {
            instance.generics = generics;
        }
        return instance;
    }
    public Instance(String typeName, ParseTree ctx, Cache cache){
        Cache.CacheBlockAndObject definition = cache.find(typeName, ctx);
        if(definition != null) this.definition = (Definition)definition.object;
        else this.genericDefinition = typeName;
    }
    public Instance(Definition definition){ this.definition = definition; }
    private Instance(Definition definition, String genericDefinition, Map<String, Instance> generics){ this.definition = definition; this.genericDefinition = genericDefinition; this.generics = generics; }
}