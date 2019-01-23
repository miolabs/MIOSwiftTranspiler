class DoubleFun {
    subscript(index: Int) -> Int {
        get {
            return index * 2
        }
        set {
            print("set for int \(index) \(newValue)")
        }
    }
    subscript(index: String) -> String {
        get {
            return index + index
        }
        set(newValue) {
            print("set for string \(index) \(newValue)")
        }
    }
    subscript(index0: Int, index1: Int) -> Int {
        return index0 + index1
    }
}
var doubleFun = DoubleFun()
print(doubleFun[2])
doubleFun[3]=4
print(doubleFun["hello"])
doubleFun["hel"]="lo"
print(doubleFun[2, 3])
