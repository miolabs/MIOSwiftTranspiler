class Parent {}
class Child: Parent {}
protocol A {
  associatedtype Elo
  func elo(a: Elo)
}
protocol B {
  func elo(a: Child)
}
class ConformsToAB: A, B {
  func elo(a: Child) {

  }
}
print("ok")
/*
the solution here should be to duplicate the function elo; one calls the other
e.g.
protocol A {
  associatedtype Elo
  func elo1(a: Elo)
}
protocol B {
  func elo2(a: Child)
}
class ConformsToAB: A, B {
  func elo1(a: Child) {
    //implementation
  }
  func elo2(a: Child) {
    elo1(a)
  }
}