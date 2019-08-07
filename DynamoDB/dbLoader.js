const fs = require('fs');
const csv = require('csv-parser');
const readline = require('readline');
const AWS = require('aws-sdk');

const csv_filename = "PATH_TO_CSV";

const credentials = new AWS.SharedIniFileCredentials({profile: 'default'});
AWS.config.credentials = credentials;
AWS.config.update({
  region: "us-west-2",
  endpoint: "http://localhost:8000",
});

const ddb = new AWS.DynamoDB();
var params = {
  AttributeDefinitions: [
    { AttributeName: 'CATEGORY', AttributeType: 'S' },
    { AttributeName: 'ITEM_ID', AttributeType: 'S' },
  ],
  KeySchema: [
    { AttributeName: 'CATEGORY', KeyType: 'HASH' }, // Primary Key
    { AttributeName: 'ITEM_ID', KeyType: 'RANGE' }, // Sort Key
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 20,
    WriteCapacityUnits: 20
  },
  TableName: 'Gallery',
  StreamSpecification: {
    StreamEnabled: false
  }
};

const makeItem = function(data) {
  if (data.category === 'VOTE') {
    return ({
      'CATEGORY': {S: data.category},
      'ITEM_ID': {S: data.itemId},
      'imageId': {S: data.imageId},
      'userId': {S: data.userId},
      'voteValue': {N: data.voteValue},
    })
  } else if (data.category === 'USER') {
    return ({
      'CATEGORY': {S: data.category},
      'ITEM_ID': {S: data.itemId},
      'userId': {S: data.userId},
      'profileImageURL': {S: data.profileImageURL},
      'username': {S: data.username},
      'friends': {N: data.friends},
      'stars': {N: data.stars},
      'elite': {BOOL: (data.elite === 'true')},
    })
  } else {
    return ({
      'CATEGORY': {S: `${data.category}`},
      'ITEM_ID': {S: data.itemId},
      'imageId': {S: data.imageId},
      'userId': {S: data.userId},
      'imageURL': {S: data.imageURL},
      'caption': {S: data.caption},
      'date': {S: data.date},
      'helpfulScore': {N: data.helpfulScore},
    });
  }
};

let chunk_no = 0;
async function processLineByLine() {
  const metadataStream = fs.createReadStream(csv_filename).pipe(csv());

  const rl = readline.createInterface({
    input: metadataStream,
    crlfDelay: Infinity,
  });

  rl.on('line', (line) => {
    // Each line in input.txt will be successively available here as `line`.
    ddb.putItem({
        TableName: "Gallery",
        Item: makeItem(line),
      }, function(err, res, cap) {
        if (err) {
          console.log(err);
          console.log('Fail chunk #' + chunk_no);
        } else {
          if (chunk_no % 10000 === 0) {
            console.log('Success chunk #' + chunk_no);
          }
        }
        chunk_no++;
      })
      .on('end', () => {
        console.log('done');
      });
  });
}

// Call DynamoDB to create the table
ddb.createTable(params, function(err, data) {
  if (err) {
    console.log("Error", err);
  } else {
    console.log("Table Created", data);

    processLineByLine();
  }
});