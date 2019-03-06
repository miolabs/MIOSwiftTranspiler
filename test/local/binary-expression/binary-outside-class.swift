struct Eq : Equatable {}
func ==(lhs: Eq, rhs: Eq) -> Bool {
  return true
}
struct NEq : Equatable {}
func ==(lhs: NEq, rhs: NEq) -> Bool {
  return false
}
print(Eq() == Eq())
print(NEq() == NEq())
