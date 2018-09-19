func swapTwoValues<T>(_ a: inout T, _ b: inout T) {
    let temporaryA = a
    a = b
    b = temporaryA
}

var someInt = 3
var anotherInt = 107
swapTwoValues(&someInt, &anotherInt)
print(someInt)
print(anotherInt)

func justReturn<T>(_ a: T) -> T {
    return a
}
print(justReturn("elo").characters.count)