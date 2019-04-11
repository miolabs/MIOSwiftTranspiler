const execSync = require('child_process').execSync
const fs = require('fs')

const dir = `${__dirname}/../../../swift-source/swift/stdlib/public/core/`

const files = fs.readdirSync(dir)

if(!fs.existsSync(`${__dirname}/swift-lib`)) fs.mkdirSync(`${__dirname}/swift-lib`)
if(!fs.existsSync(`${__dirname}/bodies`)) fs.mkdirSync(`${__dirname}/bodies`)

files.forEach(file => {
    let contents = fs.readFileSync(`${dir}${file}`, 'utf8')
    if(file.endsWith('.swift')) contents = '"-print-ranges"\n' + contents
    fs.writeFileSync(`${__dirname}/swift-lib/${file}`, contents)
})

files.forEach(file => {
    if(!file.endsWith('.swift')) return
    //if(file !== 'CollectionOfOne.swift') return
    console.log(file)
    let contents = fs.readFileSync(`${__dirname}/swift-lib/${file}`, 'utf8').split('\n')
    let output
    let isUntyped
    try {
        output = execSync(`${__dirname}/../../../swift-source/build/Ninja-RelWithDebInfoAssert/swift-macosx-x86_64/bin/swiftc -dump-ast -O -sdk /Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX10.14.sdk -F /Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/Library/Frameworks '${__dirname}/swift-lib/${file}'`, {encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe']})
    }
    catch(err) {
        output = err.stdout
    }
    try {
        let untypedOutput = execSync(`${__dirname}/../../../swift-source/build/Ninja-RelWithDebInfoAssert/swift-macosx-x86_64/bin/swiftc -dump-parse -O -sdk /Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX10.14.sdk -F /Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/Library/Frameworks '${__dirname}/swift-lib/${file}'`, {encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe']})
        if(untypedOutput.length > output.length) {
            output = untypedOutput
            isUntyped = true
        }
    }
    catch(err) {}
    let arr = eval('[' + output + ']')
    let parsedArr = [isUntyped]
    for(let i = 0; i < arr.length - 3; i+= 5) {
        let isType = arr[i]
        let identifier = arr[i + 1]
        let line0 = parseInt(arr[i + 2].split(':')[1])
        let col0 = parseInt(arr[i + 2].split(':')[2])
        let line1 = parseInt(arr[i + 3].split(':')[1])
        let col1 = parseInt(arr[i + 3].split(':')[2])
        let extLine = parseInt(arr[i + 4].split(':')[1])
        let extCol = parseInt(arr[i + 4].split(':')[2])
        let body = ''
        for(let lineI = line0; lineI <= line1; lineI++) {
            let line = contents[lineI - 1]
            if(lineI === line1) line = line.substr(0, col1)
            //if(lineI === line0) line = line.substr(col0 - 1) ignoring, as it leaves out func keywords, e.g. `mutating`
            body += (body ? '\n' : '') + line
        }
        let ext = ''
        if(extLine >= 0) {
            for(let lineI = extLine; lineI <= line1; lineI++) {
                let line = contents[lineI - 1]
                let braceIndex = line.indexOf('{')
                if(braceIndex >= 0) {
                    ext += line.slice(0, braceIndex)
                    break
                }
                else {
                    ext += line + '\n'
                }
            }
        }
        parsedArr.push({isType, identifier, body, ext})
    }
    fs.writeFileSync(`${__dirname}/bodies/${file}`, JSON.stringify(parsedArr))
})