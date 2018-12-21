import org.antlr.v4.runtime.tree.ParseTree;

import java.util.ArrayList;
import java.util.List;

public class GenericUtil {

    static public List<Generic> fromParameterClause(SwiftParser.Generic_parameter_clauseContext ctx, Visitor visitor) {
        List<Generic> generics = new ArrayList<Generic>();
        if(ctx != null) {
            List<SwiftParser.Generic_parameterContext> genericCtxs = ctx.generic_parameter_list().generic_parameter();
            for(int i = 0; i < genericCtxs.size(); i++) {
                SwiftParser.Type_identifierContext currIdentifier = genericCtxs.get(i).type_identifier();
                List<ClassDefinition> genericProtocols = new ArrayList<ClassDefinition>();
                while(currIdentifier != null) {
                    genericProtocols.add((ClassDefinition)visitor.cache.find(currIdentifier.type_name().getText(), ctx).object);
                    currIdentifier = currIdentifier.type_identifier();
                }
                generics.add(new Generic(genericCtxs.get(i).type_name().getText(), genericProtocols));
            }
        }
        return generics;
    }

    public static String targetType(Instance instance, String language) {
        if(instance.definition.generics.isEmpty()) return "";
        String type = "<";
        for(int i = 0; i < instance.definition.generics.size(); i++) {
            type += (i > 0 ? ", " : "") + instance.generics.get(instance.definition.generics.get(i).name).targetType(language);
        }
        type += ">";
        return type;
    }

    public static SwiftParser.Generic_parameter_clauseContext genericParameterClauseCtxFromFunction(ParseTree ctx) {
        return ctx instanceof SwiftParser.Function_declarationContext ? ((SwiftParser.Function_declarationContext) ctx).generic_parameter_clause() :
            ctx instanceof SwiftParser.Protocol_method_declarationContext ? ((SwiftParser.Protocol_method_declarationContext)ctx).generic_parameter_clause() :
            ctx instanceof SwiftParser.Protocol_subscript_declarationContext ? null :
            ctx instanceof SwiftParser.Subscript_declarationContext ? null :
            ((SwiftParser.Initializer_declarationContext)ctx).generic_parameter_clause();
    }

    public static Generic fromAssociatedtypeDefinition(SwiftParser.Protocol_associated_type_declarationContext ctx) {
        return new Generic(ctx.typealias_name().getText(), new ArrayList<ClassDefinition>());
    }

    public static String protocolGenericParameterClause(SwiftParser.Protocol_nameContext ctx, Visitor visitor) {
        List<Generic> generics = ((ClassDefinition)visitor.cache.find(ctx.getText(), ctx).object).generics;
        if(generics.isEmpty()) return "";
        String clause = "<";
        for(int i = 0; i < generics.size(); i++) {
            clause += (i > 0 ? ", " : "") + generics.get(i).name;
        }
        clause += ">";
        return clause;
    }
}
