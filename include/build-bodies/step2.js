//run with PRINT_EXTENSION = true

const execSync = require('child_process').execSync
const fs = require('fs')

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
for(let file of fs.readdirSync(`${__dirname}/bodies`)) {
    if(!file.endsWith('.swift') || file === 'body.swift') continue
    let arr = JSON.parse(fs.readFileSync(`${__dirname}/bodies/${file}`, 'utf8'))
    for(let prop of arr) {
        if((!prop.body.includes('func') && !prop.body.includes('var')) || !prop.body.includes('{')) continue
        let identifier = prop.identifier.split('.')
        let name = identifier.slice(prop.isType ? 3 : 2).join('.')
        if(name.includes('@')) name = name.substr(0, name.indexOf('@'))
        let pureName = name.includes('(') ? name.slice(0, name.indexOf('(')) : name
        let parent = !!prop.isType && identifier[2]
        let properIdentifier = 'Swift.(file).' + (prop.isType ? parent + '.' : '') + name
        all++
        prop.body = prop.body.replace(/_precondition\(/g, 'precondition(')
        let contents = ''
        if(prop.isType) contents += 'extension ' + parent + ' {\n'
        contents += prop.body
        if(prop.isType) contents += '\n}'
        try {
            let transpiled = transpile(contents)
            transpiled = transpiled.slice(transpiled.indexOf('{') + 1, transpiled.lastIndexOf('}'))
            //console.log(`  {"${properIdentifier}", "${transpiled.replace(/\n/g, '\\n').replace(/"/g, '\\"')}"},`)
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