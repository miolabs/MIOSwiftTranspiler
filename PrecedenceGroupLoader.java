import org.apache.commons.io.IOUtils;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

public class PrecedenceGroupLoader {

    static public Map<Integer, PrecedenceGroup> precedenceGroups = new HashMap<Integer, PrecedenceGroup>();

    static public void load(Cache cache, SwiftParser.Top_levelContext topLevel) {
        InputStream is = Prefix.class.getResourceAsStream("precedenceGroups.json");
        String jsonTxt = null;
        JSONObject definitions = null;
        try { jsonTxt = IOUtils.toString(is); } catch(IOException e) {}
        try { definitions = new JSONObject(jsonTxt); } catch(JSONException e) {}

        for(int i = 0; i < definitions.names().length(); i++) {
            String operator = definitions.names().optString(i);
            JSONObject src = definitions.optJSONObject(operator);

            PrecedenceGroup definition = parseDefinition(src, cache, topLevel);

            cache.cacheOne(operator, definition, topLevel);
            precedenceGroups.put(src.optInt("priority"), definition);
        }
    }

    static private PrecedenceGroup parseDefinition(JSONObject src, Cache cache, SwiftParser.Top_levelContext topLevel) {
        PrecedenceGroup definition = new PrecedenceGroup();

        definition.leftAssociativity = src.optBoolean("leftAssociativity");

        return definition;
    }
}
