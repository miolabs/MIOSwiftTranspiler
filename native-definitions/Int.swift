class Int {
    !def typeReplacement ts "number"
    !def typeReplacement java "Integer"
    init(_ toParse: Any) {
        !def codeReplacement ts "parseInt(#AA)"
        !def codeReplacement java "Integer.parseInt(#AA)"
    }
    static func / (left: Int, right: Int) -> Int {
        !def codeReplacement ts "((#A0 / #A1)|0)"
    }
    static func /= (left: Int, right: Int) -> Int {
        !def codeReplacement ts "#A0 = ((#A0 / #A1)|0)"
    }
}