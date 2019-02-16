//run with PRINT_EXTENSION = true

const execSync = require('child_process').execSync
const fs = require('fs')

function transpile(contents) {
    fs.writeFileSync(`${__dirname}/body.swift`, contents)
    return execSync(`/Users/bubulkowanorka/projects/swift-source/build/Ninja-RelWithDebInfoAssert/swift-macosx-x86_64/bin/swiftc -dump-ast -O -sdk /Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX10.14.sdk -F /Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/Library/Frameworks '${__dirname}/body.swift'`, {encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe']})
}

let success = 0, all = 0
for(let file of fs.readdirSync(`${__dirname}`)) {
    if(!file.endsWith('.swift') || file === 'body.swift') continue
    let arr = JSON.parse(fs.readFileSync(`${__dirname}/${file}`, 'utf8'))
    for(let prop of arr) {
        if((!prop.body.includes('func') && !prop.body.includes('var')) || !prop.body.includes('{')) continue
        let name = prop.identifier.split('.')[prop.isType ? 3 : 2]
        if(!name || name[0] === '_') continue
        if(prop.isType && (!prop.identifier.split('.')[2] || prop.identifier.split('.')[2][0] === '_')) continue
        prop.body = prop.body.replace(/_precondition\(/g, 'precondition(')
        let contents = ''
        if(prop.isType) contents += 'extension ' + prop.identifier.split('.')[2] + ' {\n'
        contents += prop.body
        if(prop.isType) contents += '\n}'
        //console.log(contents)
        try {
            let transpiled = transpile(contents)
            success++
        }
        catch(err) {
            console.log('\n')
            console.log('-----', prop.identifier)
            console.log(contents)
        }
        all++
    }
}
console.log('succeeded', success, '/', all)