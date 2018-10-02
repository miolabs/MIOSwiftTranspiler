import org.antlr.v4.runtime.ANTLRFileStream;
import org.antlr.v4.runtime.CommonTokenStream;

import java.io.IOException;

public class Main {

    //args[0] - target language (either ts or java)
    //args[1+] - input swift files to be transpiled
    public static void main(String [] args) {

        if(args.length == 0) args = new String[]{"ts", "./example.swift"};

        String targetLanguage = args[0];

        String stringInterpolationFile = "./broke-up-string-interpolation.swift";
        StringInterpolation stringInterpolation = new StringInterpolation(stringInterpolationFile);
        for(int i = 1; i < args.length; i++) {
            stringInterpolation.breakUp(args[i]);
        }
        stringInterpolation.close();

        ANTLRFileStream inputFile = null;

        try {
            inputFile = new ANTLRFileStream(stringInterpolationFile);
        } catch (IOException e) {
            e.printStackTrace();
        }

        SwiftLexer lexer = new SwiftLexer(inputFile);
        CommonTokenStream tokens = new CommonTokenStream(lexer);
        SwiftParser parser = new SwiftParser(tokens);
        SwiftParser.Top_levelContext tree = parser.top_level();

        Cache cache = new Cache();

        PrecedenceGroupLoader.load(cache, tree);
        OperatorLoader.load(cache, tree);
        TypeLoader.load(cache, tree);

        CacheVisitor cacheVisitor = new CacheVisitor(cache, targetLanguage, tree);
        cacheVisitor.visit(tree);

        TranspilerVisitor transpilerVisitor = new TranspilerVisitor(cache, targetLanguage);
        System.out.println(transpilerVisitor.visit(tree));
    }


}
