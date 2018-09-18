struct Returner<Element> {
    var item: Element? = nil
    func returnItem() -> Element {
        return item!
    }
}

var declared = Returner<String>()
declared.item = "declared"
print(declared.returnItem().characters.count)

var inferred = Returner(item: "inferred")
print(inferred.returnItem().characters.count)