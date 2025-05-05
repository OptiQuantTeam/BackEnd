const AWS = require('aws-sdk');
const util = require('../utils/util');

const s3 = new AWS.S3();
const bucketName = 'optiquant-ai-metadata';
const key = 'NEW_ALGO9_metadata_20250505_15:00:29.json';

exports.getJsonFile = async () => {
  try {
    const params = {
      Bucket: bucketName,
      Key: key
    };

    const data = await s3.getObject(params).promise();
    const jsonContent = JSON.parse(data.Body.toString());
    
    return util.buildResponse(200, jsonContent);
  } catch (error) {
    console.error('Error reading S3 file:', error);
    return util.buildResponse(500, { message: 'Error reading file from S3' });
  }
}; 