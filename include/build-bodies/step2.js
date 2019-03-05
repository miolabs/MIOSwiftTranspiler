const fs = require('fs')
const transpile = require('./step2-3.js')

let identifierUsage = {}

const PROPER_IDENTIFIERS = {
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
    'Swift.(file).Dictionary.init(_,uniquingKeysWith)': 'Swift.(file).Dictionary.init(_:S,uniquingKeysWith:(Value, Value) throws -> Value)',
    'Swift.(file).Dictionary.filter(_)': 'Swift.(file).Dictionary.filter(_:(Dictionary<Key, Value>.Element) throws -> Bool)',
    'Swift.(file).Dictionary.index(after)': 'Swift.(file).Dictionary.index(after:Dictionary<Key, Value>.Index)',
    'Swift.(file).Dictionary.formIndex(after)': 'Swift.(file).Dictionary.formIndex(after:Dictionary<Key, Value>.Index)',
    'Swift.(file).Dictionary.merge(_,uniquingKeysWith)': 'Swift.(file).Dictionary.merge(_:S,uniquingKeysWith:(Value, Value) throws -> Value)',//S
    'Swift.(file).Dictionary.merge(_,uniquingKeysWith)1': 'Swift.(file).Dictionary.merge(_:[Key : Value],uniquingKeysWith:(Value, Value) throws -> Value)',//[Key: Value]
    'Swift.(file).Dictionary.merging(_,uniquingKeysWith)': 'Swift.(file).Dictionary.merging(_:S,uniquingKeysWith:(Value, Value) throws -> Value)',//S
    'Swift.(file).Dictionary.merging(_,uniquingKeysWith)1': 'Swift.(file).Dictionary.merging(_:[Key : Value],uniquingKeysWith:(Value, Value) throws -> Value)',//[Key: Value]
    'Swift.(file).Dictionary.remove(at)': 'Swift.(file).Dictionary.remove(at:Dictionary<Key, Value>.Index)'
}

const CLARIFY_GENERICS = {
    'Swift.(file).ClosedRange.index(after:ClosedRange<Bound>.Index)': '"#clarifyGeneric#Bound.Stride#Int"',
    'Swift.(file).Range.index(after:Range<Bound>.Index)': '"#clarifyGeneric#Bound.Stride#Int"',
    'Swift.(file).Sequence.min()': '"#clarifyGeneric#Self.Element#this.first[0].constructor"',
    'Swift.(file).Sequence.max()': '"#clarifyGeneric#Self.Element#this.first[0].constructor"',
    'Swift.(file).Sequence.starts(with:PossiblePrefix)': '"#clarifyGeneric#Self.Element#this.first[0].constructor"',
    'Swift.(file).Sequence.elementsEqual(_:OtherSequence)': '"#clarifyGeneric#Self.Element#this.first[0].constructor"',
    'Swift.(file).Sequence.lexicographicallyPrecedes(_:OtherSequence)': '"#clarifyGeneric#Self.Element#this.first[0].constructor"',
    'Swift.(file).Sequence.sorted()': '"#clarifyGeneric#Self.Element#this.first[0].constructor"',
    'Swift.(file).MutableCollection.sort()': '"#clarifyGeneric#Self.Element#this.first[0].constructor"'
}

//true means don't use the whole function; false means only drop the line
const UNUSABLE_PROPS = {
    '_guts': true,
    '_stringCompare': true,
    '_variant': true,
    '_internalInvariant': false,
    '_checkIndex': false,
    '_failEarlyRangeCheck': false,
    '_expectEnd': false,
    '_customRemoveLast': false
}

const JS_REPLACEMENTS = {
    'Character': str => str.replace(/\._str/g, '')
}

function escapeRegex(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function unique(arr) {
    if(!arr) return arr
    return Array.from(new Set(arr))
}

function getProperIdentifier(isUntyped, prop, parent, pureName, name) {
    if(!isUntyped) return 'Swift.(file).' + (prop.isType ? parent + '.' : '') + name

    let includeFile
    try {
        includeFile = fs.readFileSync(`${__dirname}/../Swift/${parent || pureName}.ts`, 'utf8')
    }
    catch(e){}
    let defaultProperIdentifier = 'Swift.(file).' + (prop.isType ? parent + '.' : '') + name
    identifierUsage[defaultProperIdentifier] = defaultProperIdentifier in identifierUsage ? identifierUsage[defaultProperIdentifier] + 1 : 0
    defaultProperIdentifier += identifierUsage[defaultProperIdentifier] || ''
    if(!includeFile) {
        //console.log('!!!!no file', defaultProperIdentifier)
        return null
    }
    let properIdentifier = PROPER_IDENTIFIERS[defaultProperIdentifier]
    if(!properIdentifier) {
        let nameRegexStr = !name.includes('(') ? escapeRegex(name) : escapeRegex(name.substr(0, name.indexOf('(') + 1)) + name.slice(name.indexOf('(') + 1, name.length - 1).split(',').map((arg, i, args) => escapeRegex(arg) + '(\:[^,\\n' + (i < args.length - 1 ? '\)' : '') + ']*)?').join(',') + '\\)?'
        let identifierRegexStr = escapeRegex('/*Swift.(file).' + (prop.isType ? parent + '.' : '')) + nameRegexStr + '\\*\\/'
        let identifierRegex = new RegExp(identifierRegexStr, "g")
        let properIdentifiers = unique(includeFile.match(identifierRegex)) || []
        properIdentifier = properIdentifiers.length === 1 && properIdentifiers[0].slice(2, properIdentifiers[0].length - 2)
    }
    return properIdentifier
}

let swiftDefinitions = ''
let transpilations = ''

let success = 0, all = 0
for(let file of fs.readdirSync(`${__dirname}/bodies`)) {
    if(!file.endsWith('.swift') || file === 'body.swift') continue
    //if(file !== 'Range.swift') continue
    console.log(file)
    let arr = JSON.parse(fs.readFileSync(`${__dirname}/bodies/${file}`, 'utf8'))
    let isUntyped = arr.shift()
    for(let prop of arr) {
        let identifier = prop.identifier.split('.')
        let parent = '', nameI = 2
        for(; nameI <= identifier.length - 1; nameI++) {
            if(identifier[nameI].includes('(') || identifier[nameI].includes('@')) break
            parent += (parent ? '.' : '') + identifier[nameI]
        }
        let skip = false
        for(const unusableProp in UNUSABLE_PROPS) {
            const discard = UNUSABLE_PROPS[unusableProp];
            if(prop.body.includes(unusableProp)) {
                //console.log(prop.identifier, unusableProp)
                if(discard) {
                    skip = true
                    break
                }
                else {
                    prop.body = prop.body.split('\n').filter(line => !line.includes(unusableProp)).join('\n')
                    //console.log(prop.body)
                }
            }
        }
        if(skip) continue
        let name = identifier.slice(nameI).join('.')
        if(name.includes('@')) name = name.substr(0, name.indexOf('@'))
        let pureName = name.includes('(') ? name.slice(0, name.indexOf('(')) : name
        let properIdentifier = getProperIdentifier(isUntyped, prop, parent, pureName, name)
        if(!properIdentifier) {
            //console.log('!!!!', file, prop)
            continue
        }
        all++
        prop.body = prop.body.replace(/_precondition/g, 'precondition').replace(/_debugPrecondition/g, 'precondition')
        if(CLARIFY_GENERICS[properIdentifier]) {
            prop.body = prop.body.replace("{", "{\n" + CLARIFY_GENERICS[properIdentifier])
        }
        let contents = ''
        if(prop.isType) contents += (prop.ext || 'extension ' + parent) + ' {\n'
        contents += prop.body
        if(prop.isType) contents += '\n}'
        swiftDefinitions += '\n\n----' + properIdentifier + '\n' + contents
        try {
            let transpiled = transpile(contents, properIdentifier, pureName)
            if(JS_REPLACEMENTS[parent]) transpiled = JS_REPLACEMENTS[parent](transpiled)
            transpilations += transpiled
        }
        catch(err) {
            //console.log(err)
            continue
        }
        success++
    }
}
fs.writeFileSync(`${__dirname}/for-compiler/generated-by-step-2.txt`, transpilations)
fs.writeFileSync(`${__dirname}/swift-definitions.txt`, swiftDefinitions)
console.log('succeeded', success, '/', all)