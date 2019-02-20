func aBC(a: String = "a", b: String = "b", c: String = "c") {
    print(a)
    print(b)
    print(c)
}
aBC()
aBC(a: "A")
aBC(b: "B")
aBC(c: "C")
aBC(a: "A", b: "B")
aBC(a: "A", c: "C")
aBC(b: "B", c: "C")
aBC(a: "A", b: "B", c: "C")