import org.antlr.v4.runtime.tree.ParseTree;

import java.util.*;

public class Cache {

    static class CacheBlockAndObject {
        public ParseTree block;
        public Object object;//PrecedenceGroup/Operator/Definition/Instance

        public CacheBlockAndObject(ParseTree block, Object object) {
            this.block = block;
            this.object = object;
        }
    }

    private Map<ParseTree, Map<String, Object>> cache = new HashMap<ParseTree, Map<String, Object>>();

    static public boolean isStructureBlock(ParseTree node) {
        return (
            node instanceof SwiftParser.Class_bodyContext ||
            node instanceof SwiftParser.Struct_bodyContext ||
            node instanceof SwiftParser.Protocol_bodyContext
        );
    }

    static public String structureName(ParseTree ctx) {
        return (
            ctx instanceof SwiftParser.Class_declarationContext ? ((SwiftParser.Class_declarationContext)ctx).class_name().getText() :
            ctx instanceof SwiftParser.Struct_declarationContext ? ((SwiftParser.Struct_declarationContext)ctx).struct_name().getText() :
            ((SwiftParser.Protocol_declarationContext)ctx).protocol_name().getText()
        );
    }

    public ParseTree findNearestAncestorBlock(ParseTree node) {
        boolean isBlock =
                node instanceof SwiftParser.Top_levelContext ||
                node instanceof SwiftParser.Code_blockContext ||
                node instanceof SwiftParser.Closure_expressionContext ||
                node instanceof SwiftParser.Explicit_closure_expressionContext ||
                node instanceof SwiftParser.Switch_caseContext ||
                isStructureBlock(node);
        if(isBlock) return node;
        if(node == null || node.getParent() == null || node.getParent() == node) return null;
        return findNearestAncestorBlock(node.getParent());
    }
    public ParseTree findNearestAncestorFunctionBlock(ParseTree node) {
        boolean isBlock =
                node instanceof SwiftParser.Top_levelContext ||
                node instanceof SwiftParser.Function_bodyContext ||
                node instanceof SwiftParser.Initializer_bodyContext;
        if(isBlock) return node;
        if(node == null || node.getParent() == null || node.getParent() == node) return null;
        return findNearestAncestorFunctionBlock(node.getParent());
    }

    public CacheBlockAndObject findNearestAncestorStructure(ParseTree node) {
        if(isStructureBlock(node)) return getClassDefinition(node);
        if(node == null || node.getParent() == null || node.getParent() == node) return null;
        return findNearestAncestorStructure(node.getParent());
    }

    public CacheBlockAndObject getClassDefinition(ParseTree block) {
        if(block instanceof SwiftParser.Class_bodyContext) {
            SwiftParser.Class_declarationContext classDeclaration = (SwiftParser.Class_declarationContext)((SwiftParser.Class_bodyContext)block).parent;
            String className = classDeclaration.class_name().getText();
            return find(className, classDeclaration);
        }
        else if(block instanceof SwiftParser.Struct_bodyContext) {
            SwiftParser.Struct_declarationContext structDeclaration = (SwiftParser.Struct_declarationContext)((SwiftParser.Struct_bodyContext)block).parent;
            String className = structDeclaration.struct_name().getText();
            return find(className, structDeclaration);
        }
        else {
            SwiftParser.Protocol_declarationContext structDeclaration = (SwiftParser.Protocol_declarationContext)((SwiftParser.Protocol_bodyContext)block).parent;
            String className = structDeclaration.protocol_name().getText();
            return find(className, structDeclaration);
        }
    }

    public CacheBlockAndObject find(String varName, ParseTree node) {
        varName = varName.trim();

        do {
            Map<String, Object> blockTypeCache = cache.get(node);
            if(blockTypeCache == null) continue;
            if(blockTypeCache.containsKey(varName)) return new CacheBlockAndObject(node, blockTypeCache.get(varName));
            if(node instanceof SwiftParser.Top_levelContext) break;
        }
        while((node = findNearestAncestorBlock(node.getParent())) != null);

        return null;
    }

    public Map<String, CacheBlockAndObject> getAllTypes(ParseTree node) {
        Map<String, CacheBlockAndObject> allTypes = new HashMap<String, CacheBlockAndObject>();

        while((node = findNearestAncestorBlock(node.getParent())) != null) {
            Map<String, Object> blockTypeCache = cache.get(node);
            if(blockTypeCache == null) continue;
            for(Map.Entry<String, Object> iterator:blockTypeCache.entrySet()) {
                if(allTypes.containsKey(iterator.getKey())) continue;
                allTypes.put(iterator.getKey(), new CacheBlockAndObject(node, iterator.getValue()));
            }
            if(node instanceof SwiftParser.Top_levelContext) break;
        }
        return allTypes;
    }

    public void cacheOne(String identifier, Object object/*PrecedenceGroup/Operator/Definition/Instance*/, ParseTree ctx) {
        //System.out.println("Caching " + identifier + " as " + object.uniqueId());

        ParseTree nearestAncestorBlock = findNearestAncestorBlock(ctx);

        if(isStructureBlock(nearestAncestorBlock)) {
            //save the variable under class definition too
            CacheBlockAndObject classDefinition = getClassDefinition(nearestAncestorBlock);
            Instance property = (Instance)object;
            if(identifier.equals("init") || identifier.startsWith("init$")) {
                property.isInitializer = true;
                if(((SwiftParser.Initializer_declarationContext)ctx).initializer_head().getText().contains("?")) property.isFailableInitializer = true;
            }
            if(property.definition instanceof FunctionDefinition && ((FunctionDefinition) property.definition).operator > 0) {
                property.codeReplacement = new HashMap<String, String>();
                String replacement = ((FunctionDefinition) property.definition).operator == 1 ? "#A0, #A1" : ((FunctionDefinition) property.definition).operator == 2 ? "#A1" : "#A0";
                property.codeReplacement.put("ts", ((ClassDefinition)classDefinition.object).name + "." + identifier + "(" + replacement + ")");
            }
            ((ClassDefinition) classDefinition.object).properties.put(identifier, property);
        }

        if(!cache.containsKey(nearestAncestorBlock)) {
            cache.put(nearestAncestorBlock, new HashMap<String, Object>());
        }
        cache.get(nearestAncestorBlock).put(identifier, object);
    }
}
