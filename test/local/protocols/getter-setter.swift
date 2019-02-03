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
    var color = "white"
}
func printColor(p1: P1) {
    print(p1.color)
}
func setColor(p1: inout P1) {
    p1.color = "red"
}
var c1: P1 = C1()
var c2: P1 = C2()
printColor(p1: c1)
printColor(p1: c2)
setColor(p1: &c1)
setColor(p1: &c2)
printColor(p1: c1)
printColor(p1: c2)