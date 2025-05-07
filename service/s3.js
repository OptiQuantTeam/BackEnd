const AWS = require('aws-sdk');
const util = require('../utils/util');

const s3 = new AWS.S3();
const bucketName = 'optiquant-ai-metadata';

exports.getJsonFile = async () => {
  try {
    // 버킷의 모든 객체 목록 가져오기
    const listParams = {
      Bucket: bucketName,
      Prefix: '_metadata_' // metadata가 포함된 파일만 필터링
    };

    const listedObjects = await s3.listObjectsV2(listParams).promise();
    
    if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
      return util.buildResponse(404, { message: 'No files found' });
    }

    // 파일들을 파일명의 시간 정보를 기준으로 정렬
    const sortedFiles = listedObjects.Contents.sort((a, b) => {
      // 파일명에서 시간 정보 추출 (예: model_metadata_20240315_120000.json)
      const timeA = a.Key.split('_metadata_')[1].replace('.json', '');
      const timeB = b.Key.split('_metadata_')[1].replace('.json', '');
      return timeB.localeCompare(timeA); // 내림차순 정렬 (최신순)
    });

    // 가장 최근 파일의 키 가져오기
    const latestFile = sortedFiles[0];
    const key = latestFile.Key;

    // 최근 파일의 내용 가져오기
    const getParams = {
      Bucket: bucketName,
      Key: key
    };

    const data = await s3.getObject(getParams).promise();
    const jsonContent = JSON.parse(data.Body.toString());
    
    return util.buildResponse(200, jsonContent);
  } catch (error) {
    console.error('Error reading S3 file:', error);
    return util.buildResponse(500, { message: 'Error reading file from S3', error: error });
  }
}; 