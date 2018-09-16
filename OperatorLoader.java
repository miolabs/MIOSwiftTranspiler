import org.apache.commons.io.IOUtils;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

public class OperatorLoader {

    static public void load(Cache cache, SwiftParser.Top_levelContext topLevel) {
        InputStream is = Prefix.class.getResourceAsStream("operators.json");
        String jsonTxt = null;
        JSONObject definitions = null;
        try { jsonTxt = IOUtils.toString(is); } catch(IOException e) {}
        try { definitions = new JSONObject(jsonTxt); } catch(JSONException e) {}

        for(int i = 0; i < definitions.names().length(); i++) {
            String operator = definitions.names().optString(i);
            JSONObject src = definitions.optJSONObject(operator);

            Operator definition = parseDefinition(src, cache, topLevel);

            cache.cacheOne(operator, definition, topLevel);
        }
    }

    static private Operator parseDefinition(JSONObject src, Cache cache, SwiftParser.Top_levelContext topLevel) {
        Operator definition = new Operator();

        if(src.has("precedence")) {
            definition.precedenceGroup = (PrecedenceGroup)cache.find(src.optString("precedence"), topLevel).object;
        }

        if(src.has("result")) {
            definition.result = (Definition)cache.find(src.optString("result"), topLevel).object;
        }

        definition.codeReplacementPrefix = setCodeReplacement(src, "codeReplacementPrefix");
        definition.codeReplacementInfix = setCodeReplacement(src, "codeReplacementInfix");
        definition.codeReplacementPostfix = setCodeReplacement(src, "codeReplacementPostfix");

        definition.word = src.optString("word");

        return definition;
    }

    static private Map<String, String> setCodeReplacement(JSONObject src, String propertyName) {
        if(src.optJSONObject(propertyName) != null) {
            Map<String, String> codeReplacement = new HashMap<String, String>();
            for(int i = 0; i < src.optJSONObject(propertyName).names().length(); i++) {
                String language = src.optJSONObject(propertyName).names().optString(i);
                codeReplacement.put(language, src.optJSONObject(propertyName).optString(language));
            }
            return codeReplacement;
        }
        return null;
    }
}
