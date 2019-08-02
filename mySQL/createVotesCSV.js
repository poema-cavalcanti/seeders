/**
 * Current Votes Table Schema
 *
 * id: INTEGER NOT NULL AUTO_INCREMENT
 * value: INTEGER NULL
 * userId: INTEGER NOT NULL
 * imageId: INTEGER NOT NULL
 *
 */

const fs = require('fs');
const readline = require('readline');
const votesFile = fs.createWriteStream('./votesTable.csv');

const USERS = 10000000;
const HELPFUL = 1;
const UNHELPFUL = -1;

let vote = undefined;
let voteId = 1;
let record = undefined;

const voteCSVify = require('csv-writer').createArrayCsvStringifier({
  header: [
    {id: 'id', title: 'id'},
    {id: 'value', title: 'voteValue'},
    {id: 'imageId', title: 'imageId'},
    {id: 'userId', title: 'userId'},
  ]
});

async function processLineByLine() {
  const metadataStream = fs.createReadStream('./imagesMetadata.csv');

  const rl = readline.createInterface({
    input: metadataStream,
    crlfDelay: Infinity,
  });

  rl.on('line', (line) => {
    // Each line in input.txt will be successively available here as `line`.
    let [imageId, helpfulScore] = line.split(',');

    for (let i = 0; i < helpfulScore; i += 1) {
      vote = [];

      vote.push(voteId);
      vote.push(HELPFUL);
      vote.push(imageId);
      vote.push(Math.floor(Math.random() * USERS) + 1);

      record = [];
      record.push(JSON.parse(JSON.stringify(vote)));
      votesFile.write(voteCSVify.stringifyRecords(record));

      voteId += 1;
    }
  });
}
processLineByLine();

