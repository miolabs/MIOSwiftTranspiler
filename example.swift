enum CompassPoint {
    case north
    case south
    case east
    case west
}
var directionToHead = CompassPoint.west
directionToHead = .east
enum Barcode {
    case upc(Int, Int, Int, Int)
    case qrCode(String)
}
var productBarcode = Barcode.upc(8, 85909, 51226, 3)
productBarcode = .qrCode("ABCDEFGHIJKLMNOP")