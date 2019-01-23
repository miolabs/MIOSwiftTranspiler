protocol A {
  associatedtype Printed
  func justPrint(a: Printed)
}
protocol B {
  func justPrint(a: String)
}
class ConformsToAB: A, B {
  func justPrint(a: String) {
    print(a)
    print(a.count)
  }
}
func justPrintA<T: A>(_ printer: T, _ printed: T.Printed) {
  printer.justPrint(a: printed)
}
func justPrintB(_ printer: B, _ printed: String) {
  printer.justPrint(a: printed)
}
let conformsToAB = ConformsToAB()
justPrintA(conformsToAB, "stringA")
justPrintB(conformsToAB, "stringB!")
