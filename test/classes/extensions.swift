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
  enum Kind: String {
    case beforeK, afterK
  }
  var kind: Kind {
    if a < "k" {
      return .beforeK
    }
    else {
      return .afterK
    }
  }
}
var a = A()
print(a.a)
print(a.doubleA)
print(a["b"])
print(a.kind.rawValue)
var doubleZ = A(doubleA: "z")
print(doubleZ.a)
print(doubleZ.doubleA)
print(doubleZ["b"])
print(doubleZ.kind.rawValue)
