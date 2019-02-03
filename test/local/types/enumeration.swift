enum CompassPoint {
  case north
  case south
  case east
  case west
}
var directionToHead = CompassPoint.west
directionToHead = .east
switch directionToHead {
case .north:
  print("Lots of planets have a north")
case .south:
  print("Watch out for penguins")
case .east:
  print("Where the sun rises")
case .west:
  print("Where the skies are blue")
}
var dir2 = CompassPoint.west
var dir3 = CompassPoint.east
print(directionToHead == dir2)
print(directionToHead == dir3)
print(directionToHead != dir2)
print(directionToHead != dir3)

enum Barcode {
  case upc(Int, Int, Int, Int)
  case qrCode(String)
}
var productBarcode = Barcode.upc(8, 85909, 51226, 3)
productBarcode = .qrCode("ABCDEFGHIJKLMNOP")
switch productBarcode {
case .upc(let numberSystem, let manufacturer, let product, let check):
  print("UPC: \(numberSystem), \(manufacturer), \(product), \(check).")
case .qrCode(let productCode):
  print("QR code: \(productCode).")
}
switch productBarcode {
case let .upc(numberSystem, manufacturer, product, check):
  print("UPC : \(numberSystem), \(manufacturer), \(product), \(check).")
case let .qrCode(productCode):
  print("QR code: \(productCode).")
}

enum Planet: Int {
  case mercury = 1, venus, earth, mars, jupiter, saturn, uranus, neptune
}
let num = Planet.earth.rawValue
print(num)
let earth = Planet(rawValue: 3)
print(earth!.rawValue)
let pluto = Planet(rawValue: 9)
print(pluto?.rawValue ?? /*"pluto can't into planets"*/404)

enum ArithmeticExpression {
  case number(Int)
  indirect case addition(ArithmeticExpression, ArithmeticExpression)
  indirect case multiplication(ArithmeticExpression, ArithmeticExpression)
}
let five = ArithmeticExpression.number(5)
let four = ArithmeticExpression.number(4)
let sum = ArithmeticExpression.addition(five, four)
let product = ArithmeticExpression.multiplication(sum, ArithmeticExpression.number(2))
func evaluate(_ expression: ArithmeticExpression) -> Int {
  switch expression {
  case let .number(value):
    return value
  case let .addition(left, right):
    return evaluate(left) + evaluate(right)
  case let .multiplication(left, right):
    return evaluate(left) * evaluate(right)
  }
}
print(evaluate(five))
print(evaluate(four))
print(evaluate(sum))
print(evaluate(product))

enum AOrB: String {
  case a = "a"
  case b = "b"

  init() {
    self = .a
  }
  init(str: String) {
    if str == "isA" {
      self = .a
    }
    else {
      self = .b
    }
  }
}
var a = AOrB()
print(a.rawValue)
var a2 = AOrB(str: "isA")
print(a2.rawValue)
var b = AOrB(str: "isB")
print(b.rawValue)
var aR = AOrB(rawValue: "a")
print(aR!.rawValue)
var bR = AOrB(rawValue: "b")
print(bR!.rawValue)
var cR = AOrB(rawValue: "c")
print(cR?.rawValue ?? "non-existent")