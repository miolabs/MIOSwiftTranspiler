protocol Container {
    associatedtype Item
    func returnItem(_ item: Item) -> Item
}

//not falling over here (understanding "T.Item" I imagine; we know about T.Item: constraints in protocol + function itself)
func returnItem<T: Container>(_ container: T, _ item: T.Item) -> T.Item {
    return container.returnItem(item)
}

//1. infer that Item is Int; 2. know that returnItem is overridden function and should be using same name
struct ParticularContainer: Container {
    var items = [Int]()
    func returnItem(_ item: Int) -> Int {
        return items[item]
    }
}

let item = ParticularContainer(items: [0])
print(returnItem(item, 0))
print(item.returnItem(0))