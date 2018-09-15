struct Vector {
    var x = 0, y = 0

    static prefix func - (vector: Vector) -> Vector {
        return Vector(x: -vector.x, y: -vector.y)
    }
}

let vector = Vector(x: 3, y: 1)
let invertedVector = -vector