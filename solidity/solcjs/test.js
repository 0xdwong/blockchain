var solc = require('solc');
var fs = require('fs');


var input = {
  language: 'Solidity',
  sources: {
    'Simple.sol': {
      content: "//SPDX-License-Identifier: MIT\npragma solidity ^0.8.0;\n\ncontract Simple {\n    constructor() {}\n\n    string public foo;\n\n    function setFoo() external {\n        foo = \"bar\";\n    }\n}"
    }
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['*']
      }
    }
  }
};

var output = JSON.parse(solc.compile(JSON.stringify(input)));
// console.log('====output====', JSON.stringify(output));

fs.writeFile('output.json', JSON.stringify(output), (err) => {
  if (err) throw err;
  console.log('output.json has been written.');
});