protocol Container {
    associatedtype Item
    func returnItem(_ arg: Item) -> Item
}

protocol ComparableContainer: Container where Item: Comparable { }

protocol ComparableHashableContainer: ComparableContainer where Item: Hashable { }
