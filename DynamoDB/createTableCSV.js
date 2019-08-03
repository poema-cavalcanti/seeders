/**
 * Table Name: Gallery
 *
 * |---------------------------|------------------|------------------|------------------|
 * | Column Name               | Image Schema     | User Schema      | Vote Schema      |
 * |---------------------------|------------------|------------------|------------------|
 * | CATEGORY (Partition Key)  | businessId       | 'USER'           | 'VOTE'           |
 * | ITEM_ID  (Sort Key)       | imageId + userId | userId           | imageId + userId |
 * |---------------------------|------------------|------------------|------------------|
 * | imageId                   | String           | NULL             | String           |
 * | userId                    | String           | String           | String           |
 * | profileImageURL           | NULL             | String           | NULL             |
 * | imageURL                  | String           | NULL             | NULL             |
 * | caption                   | String           | NULL             | NULL             |
 * | date                      | String           | NULL             | NULL             |
 * | helpfulScore              | Number           | NULL             | NULL             |
 * | username                  | NULL             | String           | NULL             |
 * | friends                   | NULL             | Number           | NULL             |
 * | stars                     | NULL             | Number           | NULL             |
 * | elite                     | NULL             | Boolean          | NULL             |
 * | voteValue                 | NULL             | NULL             | Number           |
 * |---------------------------|------------------|------------------|------------------|
 *
 */

const createStringifier = require('csv-writer').createArrayCsvStringifier;
const faker = require('faker');
const uuid = require('uuid/v4');
const fs = require('fs');
const dynamoFile = fs.createWriteStream('./dynamoTable.csv');


// Constants / Global Variables

const NUM_RESTAURANTS = 10000000;

const IMAGES_S3 = 'https://devopsi-munch.s3-us-west-2.amazonaws.com/image-';
const S3_IMAGES_BEGIN_ID = 1;
const S3_IMAGES_END_ID = 69;

const USERS_S3 = 'https://devopsi-munch.s3-us-west-2.amazonaws.com/user-';
const S3_USERS_BEGIN_ID = 1;
const S3_USERS_END_ID = 10;

const MIN_IMAGES = 1;
const MAX_IMAGES = 10;

const MAX_FRIENDS = 500;
const MAX_STARS = 4;

const HELPFUL = 1;
const UNHELPFUL = -1;

const POOL_SIZE = 100;
const usersPool = [];

let restaurantCount = 0;
let imageCount = 0;
let userCount = 0;
let voteCount = 0;


const itemCSVify = createStringifier({
  header: [
    ['category'],
    ['itemId'],
    ['imageId'],
    ['userId'],
    ['profileImageURL'],
    ['imageURL'],
    ['caption'],
    ['date'],
    ['helpfulScore'],
    ['username'],
    ['friends'],
    ['stars'],
    ['elite'],
    ['voteValue'],
  ]
});

function printProgress() {
  let progress = (restaurantCount * 100) / NUM_RESTAURANTS;
  console.log(`${progress}% -> Restaurants: ${restaurantCount}, Users: ${userCount}, Images: ${imageCount}, Votes: ${voteCount}`);
}


// Factories

function createUser() {
  let user = [];

  let email = faker.internet.email().split('@');
  let userId = email[0] + userCount + '@' + email[1];
  let randId = faker.random.number({min: S3_USERS_BEGIN_ID, max: S3_USERS_END_ID});
  let elite = false;
  if (faker.random.number(10) === 10) {
    elite = true;
  }

  user.push('USER'); // category
  user.push(userId); // itemId
  user.push('NULL'); // imageId
  user.push(userId); // userId
  user.push(USERS_S3 + randId + '.jpg'); // profileImageURL
  user.push('NULL'); // imageURL
  user.push('NULL'); // caption
  user.push('NULL'); // date
  user.push('NULL'); // helpfulScore
  user.push(faker.name.findName()); // username
  user.push(faker.random.number(MAX_FRIENDS)); // friends
  user.push(faker.random.number(MAX_STARS)); // stars
  user.push(elite); // elite
  user.push('NULL'); // voteValue

  return user;
}

function createImage(restaurantId) {
  let image = [];

  let imageId = uuid();
  let userId = usersPool[Math.floor(Math.random() * usersPool.length)];
  let randId = faker.random.number({min: S3_IMAGES_BEGIN_ID, max: S3_IMAGES_END_ID});
  let helpfulScore = 0;
  if ((restaurantCount + imageCount) % 7 === 0) {
    helpfulScore = faker.random.number({min: 1, max: 3});
  }

  image.push(restaurantId); // category
  image.push(`${imageId}+${userId}`); // itemId
  image.push(imageId); // imageId
  image.push(userId); // userId
  image.push('NULL'); // profileImageURL
  image.push(IMAGES_S3 + randId + '.jpg'); // imageURL
  image.push(faker.hacker.phrase()); // caption
  image.push(faker.date.past(2)); // date
  image.push(helpfulScore); // helpfulScore
  image.push('NULL'); // username
  image.push('NULL'); // friends
  image.push('NULL'); // stars
  image.push('NULL'); // elite
  image.push('NULL'); // voteValue

  return image;
}

function createVote(imageId) {
  let vote = [];

  let userId = usersPool[Math.floor(Math.random() * usersPool.length)];

  vote.push('VOTE'); // category
  vote.push(`${imageId}+${userId}`); // itemId
  vote.push(imageId); // imageId
  vote.push(userId); // userId
  vote.push('NULL'); // profileImageURL
  vote.push('NULL'); // imageURL
  vote.push('NULL'); // caption
  vote.push('NULL'); // date
  vote.push('NULL'); // helpfulScore
  vote.push('NULL'); // username
  vote.push('NULL'); // friends
  vote.push('NULL'); // stars
  vote.push('NULL'); // elite
  vote.push(HELPFUL); // voteValue

  return vote;
}

/**
 *
 */

dynamoFile.write(itemCSVify.getHeaderString());
let record = undefined;

function write() {
  let ok = true;

  while (ok) {
    restaurantCount += 1;

    if (restaurantCount % 100000 === 0) {
      printProgress();
    }

    // Users
    while (usersPool.length < POOL_SIZE) {
      let user = createUser();
      usersPool.push(user[1]);

      record = [];
      record.push(JSON.parse(JSON.stringify(user)));
      dynamoFile.write(itemCSVify.stringifyRecords(record));

      userCount += 1;
    }

    // Images
    let numImages = faker.random.number({min: MIN_IMAGES, max: MAX_IMAGES});

    for (let i = 0; i < numImages; i += 1) {
      let image = createImage(restaurantCount);

      record = [];
      record.push(JSON.parse(JSON.stringify(image)));
      dynamoFile.write(itemCSVify.stringifyRecords(record));

      // Votes
      for (let j = 0; j < image[8]; j += 1) {
        let vote = createVote(image[2]);

        record = [];
        record.push(JSON.parse(JSON.stringify(vote)));
        ok = ok && dynamoFile.write(itemCSVify.stringifyRecords(record));

        voteCount += 1;
      }
      imageCount += 1;
    }
    usersPool.shift();
  }

  if (restaurantCount < (NUM_RESTAURANTS + 1)) {
    // write some more once it drains
    dynamoFile.once('drain', write);
  }
}

write();
