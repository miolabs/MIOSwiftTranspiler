struct Dictionary<Key, Value> {
    !def typeReplacement java "InitializableHashMap"
    !def typeReplacement javaProtocol "Map"
    init() {
        !def codeReplacement ts "new Dictionary<#Value>()"
        !def codeReplacement java "new Dictionary<#Hash, #Value>()"
    }
    subscript(index: Key) -> Value {
        !def codeReplacement ts "#L[#AA]"
        !def codeReplacement java "#L.get(#AA)"
        !def codeReplacement tsAssignment "#L[#AA] = #ASS"
        !def codeReplacement javaAssignment "#L.put(#AA, #ASS)"
        !def codeReplacement tsAssignmentNil "delete #L[#AA]#NOASS"
        !def codeReplacement javaAssignmentNil "#L.remove(#AA)#NOASS"
    }
    var count: Int {
        !def codeReplacement ts "_.size(#L)"
        !def codeReplacement java "#L.size()"
    }
    func updateValue(_ value: Value, forKey: Key) {
        !def codeReplacement ts "_.updateValue(#L, #AA)"
        !def codeReplacement java "put"
    }
}