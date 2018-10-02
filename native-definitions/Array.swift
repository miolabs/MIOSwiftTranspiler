struct Array<Value> {
    !def typeReplacement java "ArrayList"
    !def typeReplacement javaProtocol "List"
    init() {
        !def codeReplacement ts "new Array<#Value>()"
        !def codeReplacement java "new ArrayList<#Value>()"
    }
    init(repeating: Value, count: Int) {
        !def codeReplacement ts "new Array(#A1).fill(#A0)"
        !def codeReplacement java "new ArrayList<#Value>(Collections.nCopies(#A1, #A0))"
    }
    subscript(index: Int) -> Value {
        !def codeReplacement ts "#L[#AA]"
        !def codeReplacement java "#L.get(#AA)"
        !def codeReplacement tsAssignment "#L[#AA] = #ASS"
        !def codeReplacement javaAssignment "#L.put(#AA, #ASS)"
        !def codeReplacement tsAssignmentNil "#L.splice(#AA, 1)#NOASS"
        !def codeReplacement javaAssignmentNil "#L.remove(#AA)#NOASS"
    }
    static func + (left: [Value], right: [Value]) -> [Value] {
        !def codeReplacement ts "#A0.concat(#A1)"
        !def codeReplacement java "new ArrayList<String>() { { addAll(#A0); addAll(#A1); } }"
    }
    static func += (left: [Value], right: [Value]) -> Void {
        !def codeReplacement ts "#A0.pushMany(#A1)"
        !def codeReplacement java "#A0.addAll(#A1)"
    }
    var count: Int {
        !def codeReplacement ts "#L.length"
        !def codeReplacement java "#L.size()"
    }
    func enumerated() {
        !def codeReplacement ts ""
        !def codeReplacement java ""
    }
    func append(_ item: Value) {
        !def codeReplacement ts "#L.push(#AA)"
        !def codeReplacement java "#L.add(#AA)"
    }
    func append(contentsOf: [Value]) {
        !def codeReplacement ts "#L.pushMany(#AA)"
        !def codeReplacement java "#L.addAll(#AA)"
    }
    func insert(_ item: Value, at: Int) {
        !def codeReplacement ts "#L.splice(#A1, 0, #A0)"
        !def codeReplacement java "#L.add(#A1, #A0)"
    }
    func insert(contentsOf: [Value], at: Int) {
        !def codeReplacement ts "#L.pushManyAt(#AA)"
        !def codeReplacement java "#L.addAll(#A1, #A0)"
    }
    func remove(at: Int) {
        !def codeReplacement ts "#L.splice(#AA, 1)"
        !def codeReplacement java "#L.remove(#AA)"
    }
    func filter(_ by: (Value)->Bool) -> [Value] {
        !def codeReplacement ts "#L.filter(#AA)"
    }
    func sort(by: (Value,Value)->Bool) -> [Value] {
        !def codeReplacement ts "#L.sortBool(#AA)"
    }
    func map(_ by: (Value)->Value) -> [Value] {
        !def codeReplacement ts "#L.map(#AA)"
    }
    func reduce(_ start: Value, _ by: (Value,Value)->Value) -> Value {
        !def codeReplacement ts "#L.reduce(#A1, #A0)"
    }
}