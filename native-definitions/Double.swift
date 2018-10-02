class Double {
    !def typeReplacement ts "number"
    !def typeReplacement java "Float"
    init(_ toParse: Any) {
        !def codeReplacement ts "parseFloat(#AA)"
        !def codeReplacement java "Double.parseDouble(#AA)"
    }
    init(_ toParse: Int) {
        !def codeReplacement ts "#AA"
        !def codeReplacement java "#AA"
    }
    static func + (left: Double, right: Int) -> Double {
        !def codeReplacement ts "#A0 + #A1"
        !def codeReplacement java "#A0 + #A1"
    }
    static func + (left: Int, right: Double) -> Double {
        !def codeReplacement ts "#A0 + #A1"
        !def codeReplacement java "#A0 + #A1"
    }
    static func - (left: Double, right: Int) -> Double {
        !def codeReplacement ts "#A0 - #A1"
        !def codeReplacement java "#A0 - #A1"
    }
    static func - (left: Int, right: Double) -> Double {
        !def codeReplacement ts "#A0 - #A1"
        !def codeReplacement java "#A0 - #A1"
    }
    static func * (left: Double, right: Int) -> Double {
        !def codeReplacement ts "#A0 * #A1"
        !def codeReplacement java "#A0 * #A1"
    }
    static func * (left: Int, right: Double) -> Double {
        !def codeReplacement ts "#A0 * #A1"
        !def codeReplacement java "#A0 * #A1"
    }
    static func / (left: Double, right: Int) -> Double {
        !def codeReplacement ts "#A0 / #A1"
        !def codeReplacement java "#A0 / #A1"
    }
    static func / (left: Int, right: Double) -> Double {
        !def codeReplacement ts "#A0 / #A1"
        !def codeReplacement java "#A0 / #A1"
    }
    static func % (left: Double, right: Int) -> Double {
        !def codeReplacement ts "#A0 % #A1"
        !def codeReplacement java "#A0 % #A1"
    }
    static func % (left: Int, right: Double) -> Double {
        !def codeReplacement ts "#A0 % #A1"
        !def codeReplacement java "#A0 % #A1"
    }
}