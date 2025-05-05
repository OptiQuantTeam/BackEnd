const AWS = require('aws-sdk');
const util = require('../utils/util');

const s3 = new AWS.S3();
const bucketName = 'optiquant-ai-metadata';
const key = '*.json';

exports.getJsonFile = async (requestBody) => {
  try {
    const bucketName = requestBody.bucketName;
    const key = requestBody.key;
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