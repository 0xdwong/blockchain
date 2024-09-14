const solc = require('solc');
const fs = require('fs');
const util = require('util');
const loadRemoteVersion = util.promisify(solc.loadRemoteVersion);
const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);


async function getSnapshot(version = 'latest') {
  let solcSnapshot = null;
  try {
    solcSnapshot = await loadRemoteVersion(version);
    console.log('====loadRemoteVersion====', solcSnapshot.version());
  } catch (err) {
    console.error('====loadRemoteVersion failed====', err);
  }
  return solcSnapshot;
}


async function compile() {
  let input = await readFile('input.json');
  input = JSON.stringify(JSON.parse(input));

  const solcSnapshot = await getSnapshot('v0.8.20+commit.a1b79de6');
  
  let output = solcSnapshot.compile(input);
  output = JSON.parse(output);

  await writeFile('output.json', JSON.stringify(output));
  console.log('output.json has been written.');
}

compile()
  .then(() => { process.exit(0) })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })

