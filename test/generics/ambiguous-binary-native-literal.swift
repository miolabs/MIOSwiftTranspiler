func printBinary<T: BinaryInteger>(_ lhs: T, _ rhs: T) {
  print(lhs << rhs)
}
var i1: Int8 = 60, i2: Int8 = 3
var u1: UInt8 = 60, u2: UInt8 = 3
printBinary(i1, i2)
printBinary(u1, u2)