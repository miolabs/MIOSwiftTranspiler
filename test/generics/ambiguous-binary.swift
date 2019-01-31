protocol Divisible {
  static func /(lhs: Self, rhs: Self) -> String
}
class A: Divisible {
  static func /(lhs: A, rhs: A) -> String {
    return "a"
  }
}
class B: Divisible {
  static func /(lhs: B, rhs: B) -> String {
    return "b"
  }
}
func printBinary<T: Divisible>(_ lhs: T, _ rhs: T) {
  print(lhs / rhs)
}
let a1 = A(), a2 = A(), b1 = B(), b2 = B()
printBinary(a1, a2)
printBinary(b1, b2)
