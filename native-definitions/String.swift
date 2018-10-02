class String {
    !def typeReplacement ts "string"
    static func + (left: Int, right: String) -> String {
        !def codeReplacement ts "#A0 + #A1"
        !def codeReplacement java "#A0 + #A1"
    }
    static func + (left: String, right: Int) -> String {
        !def codeReplacement ts "#A0 + #A1"
        !def codeReplacement java "#A0 + #A1"
    }
    static func + (left: Double, right: String) -> String {
        !def codeReplacement ts "#A0 + #A1"
        !def codeReplacement java "#A0 + #A1"
    }
    static func + (left: String, right: Double) -> String {
        !def codeReplacement ts "#A0 + #A1"
        !def codeReplacement java "#A0 + #A1"
    }
    var characters: Void {
        !def codeReplacement ts ""
        !def codeReplacement java ""
    }
    var count: Int {
        !def codeReplacement ts "#L.length"
        !def codeReplacement java "#L.length()"
    }
}