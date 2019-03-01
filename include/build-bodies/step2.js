const execSync = require('child_process').execSync
const fs = require('fs')

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

const ignoreErrors = {
    'Swift.(file).Array.init(repeating:Element,count:Int)': true,
    'Swift.(file).Array.subscript(_:Range<Int>)': true
}

function transpile(contents, ignoreErrors) {
    fs.writeFileSync(`${__dirname}/body.swift`, '"-print-extension"\n' + contents)
    if(fs.existsSync(`${__dirname}/gowno.txt`)) fs.unlinkSync(`${__dirname}/gowno.txt`)
    let transpiled = execSync(`/Users/bubulkowanorka/projects/swift-source/build/Ninja-RelWithDebInfoAssert/swift-macosx-x86_64/bin/swiftc -dump-ast -O -sdk /Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX10.14.sdk -F /Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/Library/Frameworks '${__dirname}/body.swift'`, {encoding: 'utf8', stdio: ['pipe', 'pipe', fs.openSync(`${__dirname}/gowno.txt`, 'a+')]})
    let errors = fs.readFileSync(`${__dirname}/gowno.txt`, 'utf8')
    fs.unlinkSync(`${__dirname}/gowno.txt`)
    if(!ignoreErrors && errors.includes(': error: ')) throw errors
    return transpiled
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

let manualDefinitions = {}
let manualDefinitionsFile = fs.readFileSync(`${__dirname}/for-compiler/manual-swift.txt`, 'utf8').split('\n')
let key = '', val = ''
for(let line of manualDefinitionsFile) {
    if(line.startsWith('----')) {
        if(key) {
            manualDefinitions[key] = val
        }
        key = line.slice(4)
        val = ""
    }
    else {
        if(val) val += '\n'
        val += line
    }
}

let swiftDefinitions = ''
let transpilations = ''

let success = 0, all = 0
for(let file of fs.readdirSync(`${__dirname}/bodies`)) {
    if(!file.endsWith('.swift') || file === 'body.swift') continue
    console.log(file)
    let arr = JSON.parse(fs.readFileSync(`${__dirname}/bodies/${file}`, 'utf8'))
    let isUntyped = arr.shift()
    for(let prop of arr) {
        if((!prop.body.includes('func ') && !prop.body.includes('subscript(') && !prop.body.includes('subscript ') && !prop.body.includes('init(') && !prop.body.includes('init ') && !prop.body.includes('var ')) || !prop.body.includes('{') || prop.body.includes('prototype ') || prop.body.includes('class ') || prop.body.includes('struct ') || prop.body.includes('enum ')) continue
        let identifier = prop.identifier.split('.')
        let name = identifier.slice(prop.isType ? 3 : 2).join('.')
        if(name.includes('@')) name = name.substr(0, name.indexOf('@'))
        let pureName = name.includes('(') ? name.slice(0, name.indexOf('(')) : name
        let parent = !!prop.isType && identifier[2]
        let properIdentifier = getProperIdentifier(isUntyped, prop, parent, pureName, name)
        if(!properIdentifier) {
            //console.log('!!!!', file, prop)
            continue
        }
        all++
        prop.body = prop.body.replace(/_precondition/g, 'precondition').replace(/_debugPrecondition/g, 'precondition')
        let contents = ''
        if(prop.isType) contents += (prop.ext || 'extension ' + parent) + ' {\n'
        contents += prop.body
        if(prop.isType) contents += '\n}'
        if(manualDefinitions[properIdentifier]) contents = manualDefinitions[properIdentifier]
        swiftDefinitions += '\n\n----' + properIdentifier + '\n' + contents
        try {
            let transpiled = transpile(contents, ignoreErrors[properIdentifier])
            if(transpiled.includes('"--ignore-before";')) transpiled = transpiled.slice(transpiled.indexOf('"--ignore-before";') + '"--ignore-before";'.length)
            transpiled = transpiled.slice(transpiled.indexOf('{') + 1, transpiled.lastIndexOf('}'))
            if(transpiled.includes('}\nget ' + pureName)) {
                transpiled = transpiled.slice(0, transpiled.indexOf('}\nget ' + pureName))
            }
            while(transpiled.match(/\n;?\n/)) transpiled = transpiled.replace(/\n;?\n/g, '\n')
            while(transpiled.includes('  ')) transpiled = transpiled.replace('  ', ' ')
            while(transpiled[0] === '\n' || transpiled[0] === ';' || transpiled[0] === '0') transpiled = transpiled.slice(1)
            while(transpiled[transpiled.length - 1] === '\n' || transpiled[transpiled.length - 1] === ';' || transpiled[transpiled.length - 1] === ' ') transpiled = transpiled.slice(0, transpiled.length - 1)
            if(manualDefinitions[properIdentifier + '#SUFFIX']) contents += manualDefinitions[properIdentifier + '#SUFFIX']
            if(properIdentifier.includes('.subscript(')) {
                let subscriptSetMatch = transpiled.match(/(?:\\n)*\}(?:\\n|\s)*subscript[a-zA-Z0-9_$]*\$set\([^{]+\{(?:\\n)*/)
                if(subscriptSetMatch) {
                    let index0 = transpiled.indexOf(subscriptSetMatch[0])
                    let index1 = index0 + subscriptSetMatch[0].length
                    transpilations += '----' + properIdentifier + '#ASS\n' + transpiled.slice(index1) + '\n'
                    transpiled = transpiled.slice(0, index0)
                }
            }
            transpilations += '----' + properIdentifier + '\n' + transpiled + '\n'
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