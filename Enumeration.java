import java.util.ArrayList;
import java.util.List;

public class Enumeration {

    public static void cacheDeclaration(SwiftParser.Enum_declarationContext ctx, Visitor visitor) {

        String name = ctx.union_style_enum() != null ? ctx.union_style_enum().enum_name().getText() : ctx.raw_value_style_enum().enum_name().getText();
        Instance rawType;

        List<String> caseNames = new ArrayList<String>();
        List<String> rawValues = new ArrayList<String>();
        List<Instance> tupleTypes = new ArrayList<Instance>();

        if(ctx.union_style_enum() != null) {
            rawType = new Instance("String", ctx, visitor.cache);
            List<SwiftParser.Union_style_enum_memberContext> caseGroups = new ArrayList<SwiftParser.Union_style_enum_memberContext>();
            SwiftParser.Union_style_enum_membersContext currCaseGroup = ctx.union_style_enum().union_style_enum_members();
            while(currCaseGroup != null) {
                caseGroups.add(currCaseGroup.union_style_enum_member());
                currCaseGroup = currCaseGroup.union_style_enum_members();
            }

            for(int i = 0; i < caseGroups.size(); i++) {
                List<SwiftParser.Union_style_enum_caseContext> cases = new ArrayList<SwiftParser.Union_style_enum_caseContext>();
                SwiftParser.Union_style_enum_case_listContext currCase = caseGroups.get(i).union_style_enum_case_clause().union_style_enum_case_list();
                while(currCase != null) {
                    cases.add(currCase.union_style_enum_case());
                    currCase = currCase.union_style_enum_case_list();
                }
                for(int j = 0; j < cases.size(); j++) {
                    caseNames.add(cases.get(j).enum_case_name().getText());
                    rawValues.add('"' + cases.get(j).enum_case_name().getText() + '"');
                    if(cases.get(j).tuple_type() != null) {
                        tupleTypes.add(TypeUtil.fromTupleDefinition(cases.get(j).tuple_type().tuple_type_body().tuple_type_element_list(), visitor));
                    }
                }
            }
        }
        else {
            rawType = TypeUtil.fromName(ctx.raw_value_style_enum().type_inheritance_clause().type_inheritance_list().type_identifier().getText(), ctx, visitor);
            List<SwiftParser.Raw_value_style_enum_memberContext> caseGroups = new ArrayList<SwiftParser.Raw_value_style_enum_memberContext>();
            SwiftParser.Raw_value_style_enum_membersContext currCaseGroup = ctx.raw_value_style_enum().raw_value_style_enum_members();
            while(currCaseGroup != null) {
                caseGroups.add(currCaseGroup.raw_value_style_enum_member());
                currCaseGroup = currCaseGroup.raw_value_style_enum_members();
            }

            for(int i = 0; i < caseGroups.size(); i++) {
                List<SwiftParser.Raw_value_style_enum_caseContext> cases = new ArrayList<SwiftParser.Raw_value_style_enum_caseContext>();
                SwiftParser.Raw_value_style_enum_case_listContext currCase = caseGroups.get(i).raw_value_style_enum_case_clause().raw_value_style_enum_case_list();
                while(currCase != null) {
                    cases.add(currCase.raw_value_style_enum_case());
                    currCase = currCase.raw_value_style_enum_case_list();
                }
                for(int j = 0; j < cases.size(); j++) {
                    caseNames.add(cases.get(j).enum_case_name().getText());
                    if(cases.get(j).raw_value_assignment() != null) {
                        rawValues.add(visitor.visitChildren(cases.get(j).raw_value_assignment().raw_value_literal()).trim());
                    }
                    else {
                        if(rawType.definition.name.equals("String")) {
                            rawValues.add('"' + cases.get(j).enum_case_name().getText() + '"');
                        }
                        else if(rawValues.size() > 0) {
                            rawValues.add((Integer.parseInt(rawValues.get(rawValues.size() - 1)) + 1) + "");
                        }
                        else {
                            rawValues.add("0");
                        }
                    }
                }
            }
        }

        return;
    }
}
