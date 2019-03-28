//places the transpiled swift lib in templates/project
//to build the lib, need to run build-bodies/build.js first

const fs = require('fs')

fs.copyFileSync(`${__dirname}/test/lib/lib.js`, `${__dirname}/MIOJSLibs/templates/project/app/libs/miojslibs/marcellib.js`)
