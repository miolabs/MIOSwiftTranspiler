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
    'Swift.(file).ClosedRange.index(before:ClosedRange<Bound>.Index)': '"#clarifyGeneric#Bound.Stride#Int"',
    'Swift.(file).ClosedRange.index(_:ClosedRange<Bound>.Index,offsetBy:Int)': '"#clarifyGeneric#Bound.Stride#Int"',
    'Swift.(file).ClosedRange.distance(from:ClosedRange<Bound>.Index,to:ClosedRange<Bound>.Index)': '"#clarifyGeneric#Bound.Stride#Int"',
    'Swift.(file).ClosedRange.init(_:Range<Bound>)': '"#clarifyGeneric#Bound.Stride#Int"',
    'Swift.(file).Range.init(_:ClosedRange<Bound>)': '"#clarifyGeneric#Bound.Stride#Int"',
    'Swift.(file).Range.index(before:Range<Bound>.Index)': '"#clarifyGeneric#Bound.Stride#Int"',
    'Swift.(file).Range.index(after:Range<Bound>.Index)': '"#clarifyGeneric#Bound.Stride#Int"',
    'Swift.(file).PartialRangeFrom.Iterator.next()': '"#clarifyGeneric#Bound.Stride#Int"',
    'Swift.(file).ClosedRange.distance(from:ClosedRange<Bound>.Index,to:ClosedRange<Bound>.Index)': '"#clarifyGeneric#Bound.Stride#Int"',
    'Swift.(file).Sequence.min()': '"#clarifyGeneric#Self.Element#this.first[0].constructor"',
    'Swift.(file).Sequence.max()': '"#clarifyGeneric#Self.Element#this.first[0].constructor"',
    'Swift.(file).Sequence.starts(with:PossiblePrefix)': '"#clarifyGeneric#Self.Element#this.first[0].constructor"',
    'Swift.(file).Sequence.elementsEqual(_:OtherSequence)': '"#clarifyGeneric#Self.Element#this.first[0].constructor"',
    'Swift.(file).Sequence.lexicographicallyPrecedes(_:OtherSequence)': '"#clarifyGeneric#Self.Element#this.first[0].constructor"',
    'Swift.(file).Sequence.sorted()': '"#clarifyGeneric#Self.Element#this.first[0].constructor"',
    'Swift.(file).MutableCollection.sort()': '"#clarifyGeneric#Self.Element#this.first[0].constructor"',
    'Swift.(file).numericCast(_:T)': '"#clarifyGeneric#U#$info.U"'
}

//true means don't use the whole function; false means only drop the line
//IMPORTANT: false props before true, because that gives us the chance to rid of unneeded lines
//and potentially allow a function that would otherwise get rejected
const UNUSABLE_PROPS = {
    '_internalInvariant': false,
    '_checkIndex': false,
    '_failEarlyRangeCheck': false,
    '_expectEnd': false,
    '_customRemoveLast': false,
    'reserveCapacity': false,
    '_guts': true,
    '_stringCompare': true,
    '_variant': true,
    '_buffer': true
}

const JS_REPLACEMENTS = {
    'Character': str => str.replace(/\._str/g, '')
}

const JS_MIXINS = {
    "String": true, "Bool": true, "Double": true, "Float": true, "Float80": true,
    "Int": true, "Int8": true, "Int16": true, "Int32": true, "Int64": true, "UInt": true, "UInt8": true, "UInt16": true, "UInt32": true, "UInt64": true,
    "Array": true, "Dictionary": true, "Set": true,
    "BinaryFloatingPoint": true, "_ExpressibleByBuiltinIntegerLiteral": true, "ExpressibleByIntegerLiteral": true,
    "_ExpressibleByBuiltinFloatLiteral": true, "_CVarArgPassedAsDouble": true, "FloatingPoint": true,
    "ExpressibleByFloatLiteral": true, "SignedNumeric": true, "Numeric": true, "AdditiveArithmetic": true,
    "FixedWidthInteger": true, "UnsignedInteger": true, "BinaryInteger": true, "SignedInteger": true
}

const NUMERIC_FILES = ["FloatingPoint.swift", "IntegerParsing.swift", "Integers.swift"]
const IS_OPERATOR = name => !/[a-zA-Z_0-9]/.test(name[0])

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
        let name = identifier.slice(nameI).join('.')
        if(name.includes('@')) name = name.substr(0, name.indexOf('@'))
        let pureName = name.includes('(') ? name.slice(0, name.indexOf('(')) : name
        let properIdentifier = getProperIdentifier(isUntyped, prop, parent, pureName, name)
        if(!properIdentifier) {
            //console.log('!!!!', file, prop)
            continue
        }
        let contentsPrefix = prop.isType ? (prop.ext || 'extension ' + parent) + ' {\n' : ''
        let contentsSuffix = prop.isType ? '\n}' : ''
        swiftDefinitions += '\n\n----' + properIdentifier + '\n' + contentsPrefix + prop.body + contentsSuffix
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
        if(NUMERIC_FILES.includes(file) && IS_OPERATOR(name)) {
            //we're just allowing native js to handle numeric operators (at least for now)
            continue
        }
        all++
        prop.body = prop.body.replace(/_precondition/g, 'precondition').replace(/_debugPrecondition/g, 'precondition').replace(/_assert/g, 'assert')
        if(CLARIFY_GENERICS[properIdentifier]) {
            prop.body = prop.body.replace("{", "{\n" + CLARIFY_GENERICS[properIdentifier])
        }
        try {
            let transpiled = transpile(contentsPrefix + prop.body + contentsSuffix, properIdentifier, pureName)
            if(JS_REPLACEMENTS[parent]) transpiled = JS_REPLACEMENTS[parent](transpiled)
            if(properIdentifier.includes('.init(') && JS_MIXINS[parent]) {
                while(true) {
                    let index0 = transpiled.indexOf('$info.$setThis(_this = '), index1 = index0 + '$info.$setThis(_this = '.length, index2 = index1
                    if(index0 < 0) break
                    for(let i = 0; index2 < transpiled.length; index2++) {
                        if(transpiled[index2] === '(') i++
                        else if(transpiled[index2] === ')' && --i < 0) break
                    }
                    transpiled = transpiled.slice(0, index0) + "return " + transpiled.slice(index1, index2) + transpiled.slice(index2 + 1)
                }
            }
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