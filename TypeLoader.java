import org.antlr.v4.runtime.ANTLRInputStream;
import org.antlr.v4.runtime.CommonTokenStream;
import org.antlr.v4.runtime.ParserRuleContext;
import org.antlr.v4.runtime.RuleContext;
import org.antlr.v4.runtime.tree.ParseTree;
import org.apache.commons.io.IOUtils;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;

//loads in native data types (e.g. String, Array) and caches them as Definitions
public class TypeLoader {

    static public void load(Cache cache, SwiftParser.Top_levelContext topLevel) {

        String[] definitionFiles = {"Any", "Void", "Bool", "Int", "Double", "String", "Dictionary", "Array", "Set", "Tuple", "print"};

        String txt = "";
        for(int i = 0; i < definitionFiles.length; i++) {
            InputStream is = Prefix.class.getResourceAsStream("./native-definitions/" + definitionFiles[i] + ".swift");
            String fileTxt = null;
            try { fileTxt = IOUtils.toString(is); } catch(IOException e) {}
            txt += fileTxt + "\n";
        }

        SwiftLexer lexer = new SwiftLexer(new ANTLRInputStream(txt));
        CommonTokenStream tokens = new CommonTokenStream(lexer);
        SwiftParser parser = new SwiftParser(tokens);
        SwiftParser.Top_levelContext tree = parser.top_level();

        //setting tree children's parents as topLevel, so that when we're bubbling up the tree in search of the class definition,
        //we arrive at the same topLevel that the cache uses
        for(int i = 0; i < tree.children.size(); i++) {
            if(tree.children.get(i) instanceof RuleContext) ((RuleContext)tree.children.get(i)).parent = topLevel;
        }

        CacheVisitor cacheVisitor = new CacheVisitor(cache, null, topLevel);
        cacheVisitor.visit(tree);
    }

    static public void loadNativeDefinition(SwiftParser.Native_definition_declarationContext ctx, Visitor visitor) {
        ParseTree nearestAncestorBlock = visitor.cache.findNearestAncestorBlock(ctx);
        if(ctx.native_definition_declaration_role().getText().equals("typeReplacement")) {
            ClassDefinition classDefinition = (ClassDefinition)visitor.cache.getClassDefinition(nearestAncestorBlock).object;
            if(classDefinition.typeReplacement == null) classDefinition.typeReplacement = new HashMap<String, String>();
            classDefinition.typeReplacement.put(ctx.native_definition_declaration_language().getText(), ctx.native_definition_declaration_string().getText().replaceAll("\"", ""));
        }
        else if(visitor.cache.findNearestAncestorBlock(nearestAncestorBlock.getParent()) instanceof SwiftParser.Top_levelContext) {
            ParserRuleContext functionContext = (ParserRuleContext)(nearestAncestorBlock.getParent().getParent());
            String propertyName = new FunctionDefinition(functionContext, visitor).name;
            FunctionDefinition functionDefinition = (FunctionDefinition)visitor.cache.find(propertyName, nearestAncestorBlock).object;
            if(functionDefinition.codeReplacement == null) functionDefinition.codeReplacement = new HashMap<String, String>();
            functionDefinition.codeReplacement.put(ctx.native_definition_declaration_language().getText(), ctx.native_definition_declaration_string().getText().replaceAll("\"", ""));
        }
        else {
            ClassDefinition classDefinition = (ClassDefinition)visitor.cache.getClassDefinition(visitor.cache.findNearestAncestorBlock(nearestAncestorBlock.getParent())).object;
            String propertyName;
            if(nearestAncestorBlock.getParent().getParent() instanceof SwiftParser.Property_declarationContext) {
                propertyName = ((SwiftParser.Property_declarationContext)nearestAncestorBlock.getParent().getParent()).variable_name().getText();
            }
            else {
                ParserRuleContext functionContext = (ParserRuleContext)(nearestAncestorBlock.getParent() instanceof SwiftParser.Subscript_declarationContext ? nearestAncestorBlock.getParent() : nearestAncestorBlock.getParent().getParent());
                propertyName = new FunctionDefinition(functionContext, visitor).name;
            }
            Instance property = classDefinition.properties.get(propertyName);
            if(property.codeReplacement == null) property.codeReplacement = new HashMap<String, String>();
            property.codeReplacement.put(ctx.native_definition_declaration_language().getText(), ctx.native_definition_declaration_string().getText().replaceAll("\"", ""));
            if(property.definition instanceof FunctionDefinition) ((FunctionDefinition)property.definition).operator = 0;//FIXME
        }
    }
}
