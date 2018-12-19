protocol HasCount {
    var count: Int {get}
}

struct HasCountStruct: HasCount {
    var count: Int
    var count2: Int
}

protocol Container {
    associatedtype Item: HasCount
    subscript(i: Int) -> Item { get }
}

struct ArrayContainer: Container {
    subscript(i: Int) -> HasCountStruct {
        return HasCountStruct(count: 0, count2: 1)
    }
}

/*": HasCount" has to be explicitly stated here*/
struct GenericContainer<Item: HasCount>: Container {
    var items = [Item]()
    subscript(i: Int) -> Item {
        return items[i]
    }
}

func returnsFirstItem<G: Container>(_ arg: G) -> G.Item {
    return arg[0]
}

/*we need to know that G[0]==Item conforms to HasCount*/
func returnsFirstItemCount<G: Container>(_ arg: G) -> Int {
    return arg[0].count
}

/*we need to know that G[0]==Item is specifically HasCountStruct*/
func returnsFirstItemCount2<G: Container>(_ arg: G) -> Int where G.Item == HasCountStruct {
    return arg[0].count2
}

var stringContainer = ArrayContainer()
print(returnsFirstItem(stringContainer).count)
print(returnsFirstItemCount(stringContainer))
print(returnsFirstItemCount2(stringContainer))

/*not supported yet in our version of swift*/
protocol SuffixableContainer: Container {
    associatedtype Suffix: SuffixableContainer where Suffix.Item == HasCountStruct
    associatedtype Suffix2: SuffixableContainer where Suffix.Item == Item
    func suffix(_ size: Int) -> Suffix
    func suffix2(_ size: Int) -> Suffix2
}