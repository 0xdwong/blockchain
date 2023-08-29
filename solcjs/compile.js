const solc = require('solc');
const fs = require('fs');
const util = require('util');
const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);

async function compile() {
  let input = await readFile('input.json');
  input = JSON.stringify(JSON.parse(input));

  let output = solc.compile(input);
  console.log({input, output});
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
