struct Parent {
    enum Child: String {
        case caseA
    }
    let child: Child
}
let parent = Parent(child: .caseA)
print("parent's child: \(parent.child.rawValue)")
let child = Parent.Child.caseA
print("child: \(child.rawValue)")