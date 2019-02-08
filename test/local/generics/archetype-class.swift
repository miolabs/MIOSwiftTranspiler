struct Generic<T: Equatable> {
  var equatable: T
  func equate() -> Bool {
    return equatable == equatable
  }
}
var string = Generic(equatable: "str")
var number = Generic(equatable: 1)
print(string.equate())
print(number.equate())
