import org.antlr.v4.runtime.ParserRuleContext;

import java.util.*;

public class Enumeration {

    public static void cacheDeclaration(SwiftParser.Enum_declarationContext ctx, Visitor visitor) {

        String enumName = ctx.union_style_enum() != null ? ctx.union_style_enum().enum_name().getText() : ctx.raw_value_style_enum().enum_name().getText();
        Instance rawType;

        HashMap<String, String> rawValues = new LinkedHashMap<String, String>();
        HashMap<String, Instance> tupleTypes = null;

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
                    rawValues.put(cases.get(j).enum_case_name().getText(),  '"' + cases.get(j).enum_case_name().getText() + '"');
                    if(cases.get(j).tuple_type() != null) {
                        if(tupleTypes == null) tupleTypes = new LinkedHashMap<String, Instance>();
                        tupleTypes.put(cases.get(j).enum_case_name().getText(), TypeUtil.fromTupleDefinition(cases.get(j).tuple_type().tuple_type_body().tuple_type_element_list(), visitor));
                    }
                }
            }
        }
        else {
            rawType = TypeUtil.fromName(ctx.raw_value_style_enum().type_inheritance_clause().type_inheritance_list().type_identifier().getText(), ctx, visitor);
            String lastRawValue = null;
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
                    if(cases.get(j).raw_value_assignment() != null) {
                        lastRawValue = visitor.visitChildren(cases.get(j).raw_value_assignment().raw_value_literal()).trim();
                    }
                    else {
                        if(rawType.definition.name.equals("String")) {
                            lastRawValue = '"' + cases.get(j).enum_case_name().getText() + '"';
                        }
                        else if(lastRawValue != null) {
                            lastRawValue = (Integer.parseInt(lastRawValue) + 1) + "";
                        }
                        else {
                            lastRawValue = "0";
                        }
                    }
                    rawValues.put(cases.get(j).enum_case_name().getText(), lastRawValue);
                }
            }
        }

        rawType.enumerationDefinition = enumName;
        EnumerationDefinition enumDefinition = new EnumerationDefinition(enumName, rawType, rawValues, tupleTypes);
        visitor.cache.cacheOne(enumName, enumDefinition, ctx);
    }

    public static PrefixElem getPrefixElem(ParserRuleContext rChild, List<? extends ParserRuleContext> functionCallParams, Instance lType, Instance rType, Visitor visitor) {
        boolean isImplicitMember = lType == null;
        boolean isTuple = functionCallParams != null;
        String memberName;
        EnumerationDefinition definition;
        String code;
        Instance assignedType;
        if(isImplicitMember) {
            memberName = ((SwiftParser.Primary_expressionContext) rChild).implicit_member_expression().identifier().getText();
            definition = (EnumerationDefinition)visitor.cache.find(rType.enumerationDefinition, rChild).object;
        }
        else {
            memberName = ((SwiftParser.Explicit_member_expressionContext) rChild).identifier().getText();
            definition = (EnumerationDefinition)lType.definition;
        }
        if(memberName.equals("allCases")) {//we should also test if conforms to CaseIterable protocol
            code = "[";
            for(Map.Entry<String, String> entry : definition.rawValues.entrySet()) {
                code += (code.length() > 1 ? ", " : "") + entry.getValue();
            }
            code += "]";
            assignedType = new Instance("Array", rChild, visitor.cache);
            assignedType.generics = new HashMap<String, Instance>();
            assignedType.generics.put("Value", definition.rawType);
        }
        else if(isTuple) {
            assignedType = definition.rawType;//naughty; stored value will be {chosen, tuple}, but declared type actually equal to chosen's type
            List<String> functionCallParamsStr = PrefixElem.getFunctionCallParamsStr(functionCallParams, assignedType, null, false, null, visitor);
            String tupleCode = "";
            for(int i = 0; i < functionCallParamsStr.size(); i++) {
                tupleCode += (i > 0 ? ", " : "") + i + ": " + functionCallParamsStr.get(i);
            }
            code = "{chosen: " + definition.rawValues.get(memberName) + ", tuple: {" + tupleCode + "}}";
        }
        else {
            code = definition.rawValues.get(memberName);
            assignedType = definition.rawType;
        }
        return new PrefixElem(code, false, false, assignedType, null, null, null);
    }

    public static PrefixElem getPrefixElemFromRawValue(EnumerationDefinition definition, List<? extends ParserRuleContext> functionCallParams, Visitor visitor) {
        Instance rawType = definition.rawType.withoutPropertyInfo();//essentially used as .clone()
        rawType.isOptional = true;
        return new PrefixElem(visitor.visit(functionCallParams.get(0)), false, false, rawType, null, null, null);
    }
}
