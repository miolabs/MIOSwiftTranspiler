public protocol Distributor {
    func distribute<T>(_ element: T)
}
func bucketSort(distributor: Distributor) {
    distributor.distribute("str")
}