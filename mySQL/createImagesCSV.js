/**
 * Current Images Table Schema
 *
 * imageId: INT UNSIGNED PRIMARY KEY
 * imageURL: VARCHAR
 * caption: TEXT
 * date: DATE
 * businessId: INT UNSIGNED
 * helpfulScore: INT
 * userId: INT FOREIGN KEY
 *
 */

const createStringifier = require('csv-writer').createArrayCsvStringifier;
const faker = require('faker');

const fs = require('fs');
const imagesFile = fs.createWriteStream('./imagesTable.csv');
const metadataFile = fs.createWriteStream('./imagesMetadata.csv');

const NUM_RESTAURANTS = 10000000;
const MIN_IMAGES = 2;
const MAX_IMAGES = 20;
const PATH_TO_S3 = 'https://devopsi-munch.s3-us-west-2.amazonaws.com/image-';
const S3_IMAGE_BEGIN_ID = 1;
const S3_IMAGE_END_ID = 69;
const USERS = 10000000;

let restaurantIndex = 1;
let imageId = 1;
let image = undefined;
let record = undefined;
let id = 0;
let score = 0;


const imagesCSVify = createStringifier({
  header: [
    {id: 'imageId', title: 'imageId'},
    {id: 'imageURL', title: 'imageURL'},
    {id: 'caption', title: 'caption'},
    {id: 'date', title: 'date'},
    {id: 'businessId', title: 'businessId'},
    {id: 'helpfulScore', title: 'helpfulScore'},
    {id: 'userId', title: 'userId'},
  ]
});

const metadataCSVify = createStringifier({
  header: [
    {id: 'imageId', title: 'imageId'},
    {id: 'helpfulScore', title: 'helpfulScore'},
  ]
});

function printProgress(progress, count) {
  console.log(`Current progress: ${progress}%; Current image count: ${count}`);
}

function write() {
  let ok = true;

  while (ok) {
    if (restaurantIndex % 100000 === 0) {
      printProgress((restaurantIndex * 100) / NUM_RESTAURANTS, imageId + 1);
    }
    let numImages = faker.random.number({min: MIN_IMAGES, max: MAX_IMAGES});

    for (let j = 0; j < numImages; j += 1) {
      image = [];
      image.push(imageId); // imageId

      id = faker.random.number({min: S3_IMAGE_BEGIN_ID, max: S3_IMAGE_END_ID});
      image.push(PATH_TO_S3 + id + '.jpg'); // imageURL

      image.push(faker.hacker.phrase()); // caption

      image.push(faker.date.past(2)); // date

      image.push(restaurantIndex.valueOf()); // businessId

      score = 0;
      if ((restaurantIndex + j) % 5 === 0) {
        score = faker.random.number({min: 1, max: 5});
        record = [];
        record.push(JSON.parse(JSON.stringify([imageId, score])));
        metadataFile.write(metadataCSVify.stringifyRecords(record));
      }
      image.push(score.valueOf()); // helpfulScore

      image.push(faker.random.number({min: 1, max: USERS})); // userId

      record = [];
      record.push(JSON.parse(JSON.stringify(image)));
      ok = imagesFile.write(imagesCSVify.stringifyRecords(record));

      imageId += 1;
    }
    restaurantIndex += 1;
  }
  if (restaurantIndex < (NUM_RESTAURANTS + 1)) {
    // write some more once it drains
    imagesFile.once('drain', write);
  }
}
write();
