protocol HasColor {
    var color: String{get set}
}
protocol HasWeight {
    var weight: Int{get set}
}
protocol HasHeight {
    var height: Int{get set}
}
class C1: HasColor, HasWeight {
    var color = "black"
    var weight = 20
}
class C2: C1, HasHeight {
    var height = 180
}
var c1 = C1()
print(c1.color)
print(c1.weight)
var c2 = C2()
print(c2.color)
print(c2.weight)
print(c2.height)