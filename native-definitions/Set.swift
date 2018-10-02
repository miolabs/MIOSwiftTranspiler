struct Set<Value> {
    !def typeReplacement java "HashSet"
    !def typeReplacement javaProtocol "Set"
    init() {
        !def codeReplacement ts "new Set<#Value>()"
        !def codeReplacement java "new HashSet<#Value>()"
    }
    var count: Int {
        !def codeReplacement ts "#L.size"
        !def codeReplacement java "#L.size()"
    }
    func insert(_ value: Value) {
        !def codeReplacement ts "#L.add(#AA)"
        !def codeReplacement java "#L.add(#AA)"
    }
}