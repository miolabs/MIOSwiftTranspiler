enum Direction {
    case up
    case down
    case left
    case right
}

var loc = (x: 0, y: 0)

var steps: [Direction] = [.up, .up, .left, .down, .left]

for step in steps {
    switch step {
    case .up:
        loc.y += 1
    case .down:
        loc.y -= 1
    case .right:
        loc.x += 1
    case .left:
        loc.x -= 1
    }
}

print(loc.x)
print(loc.y)