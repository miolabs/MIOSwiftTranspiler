protocol P1 {
    var color: String{get set}
}
class C1: P1 {
    var privateColor = "black"
    var color: String {
        get {
            return privateColor
        }
        set(newColor) {
            privateColor = newColor
        }
    }
}
class C2: P1 {
    var color = "black"
}
func printColor(p1: P1) {
    print(p1.color)
}
var c1 = C1()
var c2 = C2()
printColor(p1: c1)
printColor(p1: c2)