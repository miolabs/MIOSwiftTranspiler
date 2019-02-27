const fs = require('fs')

let libBodies = fs.readFileSync(`${__dirname}/manual-definitions/old-lib-bodies.txt`, 'utf8').split('\n')
let allTranspiled = JSON.parse(fs.readFileSync(`${__dirname}/manual-definitions/transpiled.json`, 'utf8'))

for(let transpiled of allTranspiled) {
    let line = libBodies.findIndex(line => line.includes(transpiled[0]))
    if(line >= 0) libBodies.splice(line, 1)
}

console.log(libBodies.join('\n'))
