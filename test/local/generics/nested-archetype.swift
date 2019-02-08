protocol PNA1 {
  associatedtype A1: Equatable
  var a1: A1 { get set }
}
struct SNA1<T: Equatable>: PNA1 {
  var a1: T
}
var sna1 = SNA1(a1: "string")
protocol PNA2 {
  associatedtype A2: PNA1
  var a2: A2 { get set }
}
struct SNA2<T: PNA1>: PNA2 {
  var a2: T
  func printEquality() {
    print(a2.a1 == a2.a1)
  }
}
var sna2 = SNA2(a2: sna1)
sna2.printEquality()
func printEquality<T: PNA2>(_ elo: T) {
  print(elo.a2.a1 == elo.a2.a1)
}
printEquality(sna2)
