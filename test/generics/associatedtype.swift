protocol Container {
    associatedtype Item
    func returnItem(_ arg: Item) -> Item
}

func returnItem<T: Container>(_ arg: T, _ arg2: T.Item) -> T.Item {
    return arg.returnItem(arg2)
}

struct ParticularContainer: Container {
    var items = [Int]()
    func returnItem(_ arg: Int) -> Int {
        return items[arg]
    }
}

let item = ParticularContainer(items: [0])
print(returnItem(item, 0))
print(item.returnItem(0))