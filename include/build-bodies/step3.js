const fs = require('fs')
const transpile = require('./step2-3.js')

let manualDefinitions = {}
let manualDefinitionsFile = fs.readFileSync(`${__dirname}/for-compiler/manual-swift-src.txt`, 'utf8').split('\n')
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

let transpilations = ''

for(let key in manualDefinitions) {
    if(key.endsWith('#SUFFIX')) continue

    let val = manualDefinitions[key]
    console.log(key)

    transpilations += transpile(val, key, false, true, manualDefinitions[key + '#SUFFIX'])
}

fs.writeFileSync(`${__dirname}/for-compiler/manual-swift.txt`, transpilations + '----closing dashes needed for the last definition to be processed')