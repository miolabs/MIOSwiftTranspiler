struct A {
  var a: Int
  func printVar() {
    func nestedPrintVar() {
      print(a)
    }
    nestedPrintVar()
  }
}
var a = A(a: 1)
a.printVar()
