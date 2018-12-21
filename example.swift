protocol Container {
    associatedtype Item
    func returnItem(_ arg: Item) -> Item
}

func returnItem<T: Container>(_ arg: T, _ arg2: T.Item) -> T.Item {
    return arg.returnItem(arg2)
}

//when declaring class that inherits from protocols
//all their associatedtypes need to resolve to either type or generic
//so when going through a function definition, check whether it can be an implementation of one that uses associatedtypes
//if so, use associatedtype in name rather than the specific resolved type
struct ParticularContainer: Container {
    var items = [Int]()
    func returnItem(_ arg: Int) -> Int {
        return items[arg]
    }
}

let item = ParticularContainer(items: [0])
print(returnItem(item, 0))
print(item.returnItem(0))