var str:String?
print(str?.count)
str = "Message"
print((str?.count)!)

var dict = ["key": "value"]
print(dict.count)
print((dict["key"]?.count)!)
print(dict["non-existent"]?.count)

var myThirdDictionary: [String: String]?
print(myThirdDictionary?["key"])
print(myThirdDictionary?["key"]?.count)
print(myThirdDictionary?[(myThirdDictionary?["key"])!]?.count)
myThirdDictionary = ["key": "val"]
print(myThirdDictionary?[(myThirdDictionary?["key"])!]?.count)
myThirdDictionary!["val"] = "key"
print((myThirdDictionary?[(myThirdDictionary?["key"])!]?.count)!)
