var a = 1
switch a {
case 1, 2, 3:
    print("1/2/3")
default:
    print("not 1/2/3")
}
a = 3
switch a {
case 1, 2, 3:
    print("1/2/3")
default:
    print("not 1/2/3")
}
a = 4
switch a {
case 1, 2, 3:
    print("1/2/3")
default:
    print("not 1/2/3")
}
a = 1
switch a {
case 1:
    print("1")
    fallthrough
case 2:
    print("1/2")
    fallthrough
case 3:
    print("1/2/3")
default:
    print("not 1/2/3")
}
a = 3
switch a {
case 1:
    print("1")
    fallthrough
case 2:
    print("1/2")
    fallthrough
case 3:
    print("1/2/3")
default:
    print("not 1/2/3")
}
a = 4
switch a {
case 1:
    print("1")
    fallthrough
case 2:
    print("1/2")
    fallthrough
case 3:
    print("1/2/3")
default:
    print("not 1/2/3")
}
a = 2
switch a {
case 0..<3:
    print("0/1/2")
case 3...5:
    print("3/4/5")
default:
    print("not 0/1/2/3/4/5")
}
a = 3
switch a {
case 0..<3:
    print("0/1/2")
case 3...5:
    print("3/4/5")
default:
    print("not 0/1/2/3/4/5")
}
a = 5
switch a {
case 0..<3:
    print("0/1/2")
case 3...5:
    print("3/4/5")
default:
    print("not 0/1/2/3/4/5")
}
a = 6
switch a {
case 0..<3:
    print("0/1/2")
case 3...5:
    print("3/4/5")
default:
    print("not 0/1/2/3/4/5")
}
var somePoint = (0, 0)
switch somePoint {
case (0, 0):
    print("point is at the origin")
case (_, 0):
    print("point is on the x-axis")
case (0, _):
    print("point is on the y-axis")
case (-2...2, -2...2):
    print("point is inside the box")
default:
    print("point is outside of the box")
}
somePoint = (0, 1)
switch somePoint {
case (0, 0):
    print("point is at the origin")
case (_, 0):
    print("point is on the x-axis")
case (0, _):
    print("point is on the y-axis")
case (-2...2, -2...2):
    print("point is inside the box")
default:
    print("point is outside of the box")
}
somePoint = (1, 0)
switch somePoint {
case (0, 0):
    print("point is at the origin")
case (_, 0):
    print("point is on the x-axis")
case (0, _):
    print("point is on the y-axis")
case (-2...2, -2...2):
    print("point is inside the box")
default:
    print("point is outside of the box")
}
somePoint = (1, 1)
switch somePoint {
case (0, 0):
    print("point is at the origin")
case (_, 0):
    print("point is on the x-axis")
case (0, _):
    print("point is on the y-axis")
case (-2...2, -2...2):
    print("point is inside the box")
default:
    print("point is outside of the box")
}
somePoint = (5, 1)
switch somePoint {
case (0, 0):
    print("point is at the origin")
case (_, 0):
    print("point is on the x-axis")
case (0, _):
    print("point is on the y-axis")
case (-2...2, -2...2):
    print("point is inside the box")
default:
    print("point is outside of the box")
}
var nestedTuple = (0, (1, 2))
switch nestedTuple {
case (0, (1, 2)):
    print("tuple is 0/1/2")
default:
    print("tuple is not 0/1/2")
}
var anotherPoint = (2, 0)
switch anotherPoint {
case (let x, 0):
    print("on the x-axis with an x value of \(x)")
case (0, let y):
    print("on the y-axis with a y value of \(y)")
case let (x, y):
    print("somewhere else at (\(x), \(y))")
}
anotherPoint = (0, 2)
switch anotherPoint {
case (let x, 0):
    print("on the x-axis with an x value of \(x)")
case (0, let y):
    print("on the y-axis with a y value of \(y)")
case let (x, y):
    print("somewhere else at (\(x), \(y))")
}
anotherPoint = (2, 2)
switch anotherPoint {
case (let x, 0):
    print("on the x-axis with an x value of \(x)")
case (0, let y):
    print("on the y-axis with a y value of \(y)")
case let (x, y):
    print("somewhere else at (\(x), \(y))")
}
var yetAnotherPoint = (1, -1)
switch yetAnotherPoint {
case let (x, y) where x == y:
    print("(\(x), \(y)) is on the line x == y")
case let (x, y) where x == -y:
    print("(\(x), \(y)) is on the line x == -y")
case let (x, y):
    print("(\(x), \(y)) is just some arbitrary point")
}
yetAnotherPoint = (1, 1)
switch yetAnotherPoint {
case let (x, y) where x == y:
    print("(\(x), \(y)) is on the line x == y")
case let (x, y) where x == -y:
    print("(\(x), \(y)) is on the line x == -y")
case let (x, y):
    print("(\(x), \(y)) is just some arbitrary point")
}
yetAnotherPoint = (3, 4)
switch yetAnotherPoint {
case let (x, y) where x == y:
    print("(\(x), \(y)) is on the line x == y")
case let (x, y) where x == -y:
    print("(\(x), \(y)) is on the line x == -y")
case let (x, y):
    print("(\(x), \(y)) is just some arbitrary point")
}