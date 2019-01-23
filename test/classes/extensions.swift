struct A {
  var a = "a"
}
extension A {
  var doubleA: String {
    return a + a
  }
  init(doubleA: String) {
    self.init(a: doubleA)
  }
  func printDoubleA() {
    print(a + a)
  }
  subscript(addedIndex: String) -> String {
    return a + addedIndex
  }
}
var a = A()
print(a.a)
print(a.doubleA)
print(a["b"])
var doubleZ = A(doubleA: "z")
print(doubleZ.a)
print(doubleZ.doubleA)
print(doubleZ["b"])