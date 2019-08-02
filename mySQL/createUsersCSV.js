/**
 * Current Users Table Schema
 *
 * userId: INT UNSIGNED PRIMARY KEY
 * profileImageURL: VARCHAR
 * username: VARCHAR
 * friends: INT UNSIGNED
 * stars: INT
 * elite: BOOLEAN
 *
 */

const faker = require('faker');
const fs = require('fs');

const usersFile = fs.createWriteStream('./usersTable.csv');

const PATH_TO_S3 = 'https://devopsi-munch.s3-us-west-2.amazonaws.com/user-';
const S3_IMAGE_BEGIN_ID = 1;
const S3_IMAGE_END_ID = 10;
const MAX_FRIENDS = 500;
const MAX_STARS = 4;
const USERS = 10000000;

let userIndex = 1;
let user = undefined;
let record = undefined;

const userCSVify = require('csv-writer').createArrayCsvStringifier({
  header: [
    {id: 'id', title: 'id'},
    {id: 'profileImageURL', title: 'profileImageURL'},
    {id: 'username', title: 'username'},
    {id: 'friends', title: 'friends'},
    {id: 'stars', title: 'stars'},
    {id: 'elite', title: 'elite'},
  ]
});

function printProgress(progress, count) {
  console.log(`Current progress: ${progress}%; Current user count: ${count}`);
}

function write() {
  let ok = true;

  while (ok) {
    if (userIndex % 500000 === 0) {
      printProgress((userIndex * 100) / USERS, userIndex);
    }

    user = [];
    user.push(userIndex); // userId

    id = faker.random.number({min: S3_IMAGE_BEGIN_ID, max: S3_IMAGE_END_ID});
    user.push(PATH_TO_S3 + id + '.jpg'); // profileImageURL

    user.push(faker.name.findName()); // username

    user.push(faker.random.number(MAX_FRIENDS)); // friends

    user.push(faker.random.number(MAX_STARS)); // stars

    let elite = 0;
    if (faker.random.number(10) === 10) {
      elite = 1;
    }
    user.push(elite); // elite

    record = [];
    record.push(JSON.parse(JSON.stringify(user)));
    ok = usersFile.write(userCSVify.stringifyRecords(record));

    userIndex += 1;
  }
  if (userIndex < (USERS + 1)) {
    // had to stop early!
    // write some more once it drains
    usersFile.once('drain', write);

  }
  // usersFile.end();
}

write();

