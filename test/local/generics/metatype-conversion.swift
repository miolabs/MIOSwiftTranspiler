class A<T> {
  var child: T
  required init(child: T) {
    self.child = child
  }
  func printChild() {
    print(child)
  }
}
class B<T>: A<T> {
  override func printChild() {
    print("B")
    print(child)
  }
}
func printAChild<T>(AType: A<T>.Type, child: T) {
  let a = AType.init(child: child)
  a.printChild()
}
printAChild(AType: A<String>.self, child: "a")
printAChild(AType: B<String>.self, child: "b")
