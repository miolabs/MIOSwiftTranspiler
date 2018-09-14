enum Planet: Int {
    case mercury = 1, venus, earth, mars, jupiter, saturn, uranus, neptune
}
let num = Planet.earth.rawValue
print(num)
let earth = Planet(rawValue: 3)
print(earth!.rawValue)