//builds MIOJSLibs and places the output .js file in templates/project

const execSync = require('child_process').execSync
const fs = require('fs')

execSync(`cd ${__dirname}/MIOJSLibs && npm run dev && cd ..`)
fs.copyFileSync(`${__dirname}/MIOJSLibs/packages/miojslibs/dist/js/miojslibs.js`, `${__dirname}/MIOJSLibs/templates/project/app/libs/miojslibs/miojslibs.js`)
