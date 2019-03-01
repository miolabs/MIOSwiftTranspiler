const execSync = require('child_process').execSync
const fs = require('fs')

function transpile(contents, ignoreErrors) {
    fs.writeFileSync(`${__dirname}/body.swift`, '"-print-extension"\n' + contents)
    if(fs.existsSync(`${__dirname}/gowno.txt`)) fs.unlinkSync(`${__dirname}/gowno.txt`)
    let transpiled
    try{
        transpiled = execSync(`/Users/bubulkowanorka/projects/swift-source/build/Ninja-RelWithDebInfoAssert/swift-macosx-x86_64/bin/swiftc -dump-ast -O -sdk /Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX10.14.sdk -F /Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/Library/Frameworks '${__dirname}/body.swift'`, {encoding: 'utf8', stdio: ['pipe', 'pipe', fs.openSync(`${__dirname}/gowno.txt`, 'a+')]})
    }catch(err){
        if(ignoreErrors) transpiled = err.stdout
        else throw err
    }
    let errors = fs.readFileSync(`${__dirname}/gowno.txt`, 'utf8')
    fs.unlinkSync(`${__dirname}/gowno.txt`)
    return transpiled
}

module.exports = function(contents, properIdentifier, pureName, ignoreErrors, suffix) {

    let transpiled = transpile(contents, ignoreErrors)
    let result = ''

    if(transpiled.includes('"--ignore-before";')) transpiled = transpiled.slice(transpiled.indexOf('"--ignore-before";') + '"--ignore-before";'.length)
    transpiled = transpiled.slice(transpiled.indexOf('{') + 1, transpiled.lastIndexOf('}'))
    if(transpiled.includes('}\nget ' + pureName)) {
        transpiled = transpiled.slice(0, transpiled.indexOf('}\nget ' + pureName))
    }
    while(transpiled.match(/\n;?\n/)) transpiled = transpiled.replace(/\n;?\n/g, '\n')
    while(transpiled.includes('  ')) transpiled = transpiled.replace('  ', ' ')
    while(transpiled[0] === '\n' || transpiled[0] === ';' || transpiled[0] === '0') transpiled = transpiled.slice(1)
    while(transpiled[transpiled.length - 1] === '\n' || transpiled[transpiled.length - 1] === ';' || transpiled[transpiled.length - 1] === ' ') transpiled = transpiled.slice(0, transpiled.length - 1)
    if(suffix) transpiled += suffix
    if(properIdentifier.includes('.subscript(')) {
        let subscriptSetMatch = transpiled.match(/(?:\\n)*\}(?:\\n|\s)*subscript[a-zA-Z0-9_$]*\$set\([^{]+\{(?:\\n)*/)
        if(subscriptSetMatch) {
            let index0 = transpiled.indexOf(subscriptSetMatch[0])
            let index1 = index0 + subscriptSetMatch[0].length
            result += '----' + properIdentifier + '#ASS\n' + transpiled.slice(index1) + '\n'
            transpiled = transpiled.slice(0, index0)
        }
    }

    result += '----' + properIdentifier + '\n' + transpiled + '\n'
    return result
}