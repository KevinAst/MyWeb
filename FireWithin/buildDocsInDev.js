// This script will execute a gitbook command to build our docs in a development env
//  - we need this because in development we want re-gen the docs anytime the master doc source changes
//  - we accomplish this through nodemon, which executes a node script NOT a gitbook command
//  - hence the reason for this script (a node script that simply passes-through to the gitbook command)

const {exec} = require("child_process");

const buildScript = 'gitbook build FireWithin MyPage/FireWithin';

console.log('buildDocsInDev executing: ' + buildScript);

exec(buildScript, (error, stdout, stderr) => {
  if (error) {
    console.log(`ERROR:\n${error.message}`);
    return;
  }
  if (stderr) {
    console.log(`stderr:\n${stderr}`);
  }
  console.log(`stdout:\n${stdout}`);
});
