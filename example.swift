struct Vector {
    var x = 0, y = 0

    static func + (left: Vector, right: Vector) -> Vector {
        return Vector(x: left.x + right.x, y: left.y + right.y)
    }
}

let vector = Vector(x: 3, y: 1)
let anotherVector = Vector(x: 2, y: 6)
let combinedVector = vector + anotherVector

print(combinedVector.x)
print(combinedVector.y)