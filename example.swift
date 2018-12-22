protocol Container {
    associatedtype Item
    func returnItem(_ item: Item) -> Item
}

func returnItem<T: Container>(_ container: T, _ item: T.Item) -> T.Item {
    return container.returnItem(item)
}

struct ParticularContainer: Container {
    var items = [Int]()
    func returnItem(_ item: Int) -> Int {
        return items[item]
    }
}