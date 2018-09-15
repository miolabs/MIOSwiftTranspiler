struct Vector {
    var x = 0, y = 0
    
    static func + (left: Vector, right: Vector) -> Vector {
        return Vector(x: left.x + right.x, y: left.y + right.y)
    }
    static prefix func - (vector: Vector) -> Vector {
        return Vector(x: -vector.x, y: -vector.y)
    }
    static postfix func -- (vector: Vector) -> Vector {
        return Vector(x: -vector.x, y: -vector.y)
    }
}

let vector = Vector(x: 3, y: 1)
let anotherVector = Vector(x: 2, y: 6)
let combinedVector = vector + anotherVector
let invertedVector = -combinedVector
let invertedVector2 = vector--

print(combinedVector.x)
print(combinedVector.y)
print(invertedVector.x)
print(invertedVector.y)
print(invertedVector2.x)
print(invertedVector2.y)