print([0, 1, 2][[0, 1].count])
print([0, 1, 2][Set([0, 1, 1]).count])
var dict: [String: String]? = ["key": "val"]
print([0, 1, 2, 3, 4][(dict?["key"]?.count)!])
