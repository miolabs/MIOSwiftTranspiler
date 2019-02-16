//run with PRINT_EXTENSION = true

const execSync = require('child_process').execSync
const fs = require('fs')

let identifierUsage = {}

const PROPER_IDENTIFIERS = {
    'Swift.(file).ClosedRange.overlaps(_)': 'Swift.(file).ClosedRange.overlaps(_:ClosedRange<Bound>)',
    'Swift.(file).ClosedRange.overlaps(_)1': 'Swift.(file).ClosedRange.overlaps(_:Range<Bound>)',
    'Swift.(file).Collection.index(_,offsetBy)': 'Swift.(file).Collection.index(_:Self.Index,offsetBy:Int)',
    'Swift.(file).Collection.index(_,offsetBy,limitedBy)': 'Swift.(file).Collection.index(_:Self.Index,offsetBy:Int,limitedBy:Self.Index)',
    'Swift.(file).Collection.formIndex(_,offsetBy)': 'Swift.(file).Collection.formIndex(_:Self.Index,offsetBy:Int)',
    'Swift.(file).Collection.formIndex(_,offsetBy,limitedBy)': 'Swift.(file).Collection.formIndex(_:Self.Index,offsetBy:Int,limitedBy:Self.Index)',
    'Swift.(file).RandomAccessCollection.index(_,offsetBy)': 'Swift.(file).RandomAccessCollection.index(_:Self.Index,offsetBy:Self.Index.Stride)',
    'Swift.(file).Range.overlaps(_)': 'Swift.(file).Range.overlaps(_:Range<Bound>)',
    'Swift.(file).Range.overlaps(_)1': 'Swift.(file).Range.overlaps(_:ClosedRange<Bound>)',
    'Swift.(file).RangeReplaceableCollection.insert(contentsOf,at)': 'Swift.(file).RangeReplaceableCollection.insert(contentsOf:C,at:Self.Index)',
    'Swift.(file).RangeReplaceableCollection.removeSubrange(_)': 'Swift.(file).RangeReplaceableCollection.removeSubrange(_:Range<Self.Index>)',
    'Swift.(file).RangeReplaceableCollection.replaceSubrange(_,with)': 'Swift.(file).RangeReplaceableCollection.replaceSubrange(_:R,with:C)',
    'Swift.(file).RangeReplaceableCollection.removeSubrange(_)1': 'Swift.(file).RangeReplaceableCollection.removeSubrange(_:R)',
    'Swift.(file).Set.insert(_)': 'Swift.(file).Set.insert(_:Element)',
    'Swift.(file).Set.update(with)': 'Swift.(file).Set.update(with:Element)',
    'Swift.(file).Set.remove(_)': 'Swift.(file).Set.remove(_:Element)',
    'Swift.(file).Set.isSubset(of)': 'Swift.(file).Set.isSubset(of:S)',
    'Swift.(file).Set.isStrictSubset(of)': 'Swift.(file).Set.isStrictSubset(of:S)',
    'Swift.(file).Set.isSuperset(of)': 'Swift.(file).Set.isSuperset(of:S)',
    'Swift.(file).Set.isStrictSuperset(of)': 'Swift.(file).Set.isStrictSuperset(of:S)',
    'Swift.(file).Set.isDisjoint(with)': 'Swift.(file).Set.isDisjoint(with:S)',
    'Swift.(file).Set.subtracting(_)': 'Swift.(file).Set.subtracting(_:S)',
    'Swift.(file).Set.subtract(_)': 'Swift.(file).Set.subtract(_:S)',
    'Swift.(file).Set.intersection(_)': 'Swift.(file).Set.intersection(_:S)',
    'Swift.(file).Set.formSymmetricDifference(_)': 'Swift.(file).Set.formSymmetricDifference(_:S)',
    'Swift.(file).Set.subtract(_)1': 'Swift.(file).Set.subtract(_:Set<Element>)',
    'Swift.(file).Set.isSubset(of)1': 'Swift.(file).Set.isSubset(of:Set<Element>)',
    'Swift.(file).Set.isSuperset(of)1': 'Swift.(file).Set.isSuperset(of:Set<Element>)',
    'Swift.(file).Set.isDisjoint(with)1': 'Swift.(file).Set.isDisjoint(with:Set<Element>)',
    'Swift.(file).Set.subtracting(_)1': 'Swift.(file).Set.subtracting(_:Set<Element>)',
    'Swift.(file).Set.isStrictSuperset(of)1': 'Swift.(file).Set.isStrictSuperset(of:Set<Element>)',
    'Swift.(file).Set.isStrictSubset(of)1': 'Swift.(file).Set.isStrictSubset(of:Set<Element>)',
    'Swift.(file).Set.intersection(_)1': 'Swift.(file).Set.intersection(_:Set<Element>)',
    'Swift.(file).Set.formSymmetricDifference(_)1': 'Swift.(file).Set.formSymmetricDifference(_:Set<Element>)',
    'Swift.(file).Substring.replaceSubrange(_,with)': 'Swift.(file).Substring.replaceSubrange(_:Range<Substring.Index>,with:C)',
    'Swift.(file).Substring.replaceSubrange(_,with)1': 'Swift.(file).Substring.replaceSubrange(_:Range<Substring.Index>,with:Substring)',
    'Swift.(file).Dictionary.init(_,uniquingKeysWith)': 'Swift.(file).Dictionary.init(_:S,uniquingKeysWith:(Value, Value) throws -> Value)',
    'Swift.(file).Dictionary.filter(_)': 'Swift.(file).Dictionary.filter(_:(Dictionary<Key, Value>.Element) throws -> Bool)',
    'Swift.(file).Dictionary.index(after)': 'Swift.(file).Dictionary.index(after:Dictionary<Key, Value>.Index)',
    'Swift.(file).Dictionary.formIndex(after)': 'Swift.(file).Dictionary.formIndex(after:Dictionary<Key, Value>.Index)',
    'Swift.(file).Dictionary.merge(_,uniquingKeysWith)': 'Swift.(file).Dictionary.merge(_:S,uniquingKeysWith:(Value, Value) throws -> Value)',//S
    'Swift.(file).Dictionary.merge(_,uniquingKeysWith)1': 'Swift.(file).Dictionary.merge(_:[Key : Value],uniquingKeysWith:(Value, Value) throws -> Value)',//[Key: Value]
    'Swift.(file).Dictionary.merging(_,uniquingKeysWith)': 'Swift.(file).Dictionary.merging(_:S,uniquingKeysWith:(Value, Value) throws -> Value)',//S
    'Swift.(file).Dictionary.merging(_,uniquingKeysWith)1': 'Swift.(file).Dictionary.merging(_:[Key : Value],uniquingKeysWith:(Value, Value) throws -> Value)',//[Key: Value]
    'Swift.(file).Dictionary.remove(at)': 'Swift.(file).Dictionary.remove(at:Dictionary<Key, Value>.Index)',
    'Swift.(file).Array.init(_unsafeUninitializedCapacity,initializingWith)': 'Swift.(file).Array.init(_unsafeUninitializedCapacity:Int,initializingWith:(inout UnsafeMutableBufferPointer<Element>, inout Int) throws -> Void)'
}

function transpile(contents) {
    fs.writeFileSync(`${__dirname}/body.swift`, contents)
    return execSync(`/Users/bubulkowanorka/projects/swift-source/build/Ninja-RelWithDebInfoAssert/swift-macosx-x86_64/bin/swiftc -dump-ast -O -sdk /Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX10.14.sdk -F /Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/Library/Frameworks '${__dirname}/body.swift'`, {encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe']})
}

function escapeRegex(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function unique(arr) {
    if(!arr) return arr
    return Array.from(new Set(arr))
}

let success = 0, all = 0
for(let file of fs.readdirSync(`${__dirname}`)) {
    if(!file.endsWith('.swift') || file === 'body.swift') continue
    let arr = JSON.parse(fs.readFileSync(`${__dirname}/${file}`, 'utf8'))
    for(let prop of arr) {
        if((!prop.body.includes('func') && !prop.body.includes('var')) || !prop.body.includes('{')) continue
        let identifier = prop.identifier.split('.')
        let name = identifier.slice(prop.isType ? 3 : 2).join('.')
        if(name.includes('@')) name = name.substr(0, name.indexOf('@'))
        let pureName = name.includes('(') ? name.slice(0, name.indexOf('(')) : name
        let parent = !!prop.isType && identifier[2]
        let includeFile
        try {
            includeFile = fs.readFileSync(`${__dirname}/../Swift/${parent || pureName}.ts`, 'utf8')
        }
        catch(e){}
        let defaultProperIdentifier = 'Swift.(file).' + (prop.isType ? parent + '.' : '') + name
        identifierUsage[defaultProperIdentifier] = defaultProperIdentifier in identifierUsage ? identifierUsage[defaultProperIdentifier] + 1 : 0
        defaultProperIdentifier += identifierUsage[defaultProperIdentifier] || ''
        if(!includeFile) {
            //console.log('no file', defaultProperIdentifier)
            continue
        }
        let properIdentifier = PROPER_IDENTIFIERS[defaultProperIdentifier]
        if(!properIdentifier) {
            let nameRegexStr = !name.includes('(') ? escapeRegex(name) : escapeRegex(name.substr(0, name.indexOf('(') + 1)) + name.slice(name.indexOf('(') + 1, name.length - 1).split(',').map((arg, i, args) => escapeRegex(arg) + '(\:[^,\\n' + (i < args.length - 1 ? '\)' : '') + ']*)?').join(',') + '\\)?'
            let identifierRegexStr = escapeRegex('/*Swift.(file).' + (prop.isType ? parent + '.' : '')) + nameRegexStr + '\\*\\/'
            let identifierRegex = new RegExp(identifierRegexStr, "g")
            let properIdentifiers = unique(includeFile.match(identifierRegex)) || []
            properIdentifier = properIdentifiers.length === 1 && properIdentifiers[0].slice(2, properIdentifiers[0].length - 2)
        }
        if(!properIdentifier) {
            //console.log(properIdentifiers.length ? 'too many matches' : 'no matches', defaultProperIdentifier)
            continue
        }
        all++
        prop.body = prop.body.replace(/_precondition\(/g, 'precondition(')
        let contents = ''
        if(prop.isType) contents += 'extension ' + parent + ' {\n'
        contents += prop.body
        if(prop.isType) contents += '\n}'
        try {
            let transpiled = transpile(contents)
        }
        catch(err) {
            console.log('\n')
            console.log('-----', properIdentifier)
            console.log(contents)
            continue
        }
        success++
    }
}
console.log('succeeded', success, '/', all)