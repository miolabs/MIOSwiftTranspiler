protocol P {
  static func printSomething()
}
class CP: P {
  static func printSomething() {
    print("printed")
  }
}
class C<T: P> {
  static func printSomething() {
    T.printSomething()
  }
}
C<CP>.printSomething()
