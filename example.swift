struct Vector2D {
    var x = 0, y = 0
    static func += (left: inout Vector2D, right: Vector2D) {
    }
    static prefix func +++ (vector: inout Vector2D) -> Vector2D {
        vector += vector
        return vector
    }
}