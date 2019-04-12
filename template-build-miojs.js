//builds MIOJSLibs and places the output .js file in templates/project

const execSync = require('child_process').execSync
const fs = require('fs')

execSync(`cd ${__dirname}/MIOJSLibs && export TRANSPILER=false && npm run dev && cd ..`)

execSync(`node ${__dirname}/include/build-bodies/build-miojslibs.js`)
execSync(`ts-node --disableWarnings ${__dirname}/include/build-bodies/refactor-miojslibs.ts`)

execSync(`cd ${__dirname}/MIOJSLibs && export TRANSPILER=true && npm run dev && cd ..`)

fs.copyFileSync(
    `${__dirname}/packages/miojslibs-swift-transpiler/build/miojslibs-swift-transpiler.js`,
    `${__dirname}/MIOJSLibs/templates/project/app/libs/miojslibs/miojslibs.js`
)
