import org.antlr.v4.runtime.tree.ParseTree;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class GenericUtil {

    static public Generics fromParameterClause(SwiftParser.Generic_parameter_clauseContext ctx, Visitor visitor) {
        List<String> generics = new ArrayList<String>();
        Map<String, TypeConstraint> genericTypeConstraints = new HashMap<String, TypeConstraint>();
        if(ctx != null) {
            List<SwiftParser.Generic_parameterContext> genericCtxs = ctx.generic_parameter_list().generic_parameter();
            for(int i = 0; i < genericCtxs.size(); i++) {
                SwiftParser.Type_identifierContext currIdentifier = genericCtxs.get(i).type_identifier();
                List<ClassDefinition> genericProtocols = new ArrayList<ClassDefinition>();
                while(currIdentifier != null) {
                    genericProtocols.add((ClassDefinition)visitor.cache.find(currIdentifier.type_name().getText(), ctx).object);
                    currIdentifier = currIdentifier.type_identifier();
                }
                String generic = genericCtxs.get(i).type_name().getText();
                generics.add(generic);
                genericTypeConstraints.put(generic, new TypeConstraint(genericProtocols, null));
            }
        }
        return new Generics(generics, genericTypeConstraints);
    }

    public static String targetType(Instance instance, String language) {
        if(instance.definition.generics.names.isEmpty()) return "";
        String type = "<";
        for(int i = 0; i < instance.definition.generics.names.size(); i++) {
            type += (i > 0 ? ", " : "") + instance.generics.get(instance.definition.generics.names.get(i)).targetType(language);
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

    public static String protocolGenericParameterClause(SwiftParser.Protocol_nameContext ctx, Visitor visitor) {
        List<String> generics = ((ClassDefinition)visitor.cache.find(ctx.getText(), ctx).object).generics.names;
        if(generics.isEmpty()) return "";
        String clause = "<";
        for(int i = 0; i < generics.size(); i++) {
            clause += (i > 0 ? ", " : "") + generics.get(i);
        }
        clause += ">";
        return clause;
    }
}
