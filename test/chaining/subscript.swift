class DoubleFun {
    subscript(index: Int) -> Int {
        get {
            return index * 2
        }
        set {}
    }
    subscript(index: String) -> String {
        get {
            return index + index
        }
        set(newValue) {}
    }
    subscript(index0: Int, index1: Int) -> Int {
        return index0 + index1
    }
}
var doubleFun = DoubleFun()
print(doubleFun[2])
print(doubleFun["hello"])
print(doubleFun[2, 3])
