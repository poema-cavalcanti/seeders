/**
 *
 *
 */

const fs = require('fs');
const readline = require('readline');

let vote = undefined;

const voteCSVify = require('csv-writer').createArrayCsvStringifier({
  header: [
    {id: 'id', title: 'id'},
    {id: 'imageId', title: 'imageId'},
    {id: 'userId', title: 'userId'},
    {id: 'value', title: 'voteValue'}
  ]
});



async function processLineByLine() {
  const metadataStream = fs.createReadStream('./imagesMetadata.csv');

  const rl = readline.createInterface({
    input: metadataStream,
  });

  for await (const line of rl) {
    // Each line in input.txt will be successively available here as `line`.
    let [imageId, helpfulScore] = line.split(',');

  }
}

processLineByLine();

