const AWS = require('aws-sdk');
AWS.config.update({
  region: 'ap-northeast-2'
})
const util = require('../utils/util');
const binance = require('../utils/binance');
const auth = require('../utils/auth');
const setting = require('../utils/setting');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const userTable = 'User';

async function content(requestBody){
  const user_id = requestBody.user_id;
  const token = requestBody.token;
  const type = requestBody.type;
  let response;
  
  const verification = auth.verifyToken(user_id, token);
  if (!verification.verified){
    return util.buildResponse(401, verification)
  }

  const dynamoUser = await getUser(user_id.toLowerCase().trim());
  if(!dynamoUser || !dynamoUser.user_id){
    return util.buildResponse(403, {
      message: 'User not found.'
    })
  }


  switch (type) {
    case 'contractList':
      if(!dynamoUser || !dynamoUser.api_key || !dynamoUser.secret_key) {
        return util.buildResponse(403, {
          message: 'API KEY and SECRET KEY Not Found.'
        })
      }
      const contractData = await binance.getContractList(dynamoUser.api_key, dynamoUser.secret_key, requestBody.timestamp);
      response = {
        data : contractData
      }
      break;
    case 'income':
      if(!dynamoUser || !dynamoUser.api_key || !dynamoUser.secret_key) {
        return util.buildResponse(403, {
          message: 'API KEY and SECRET KEY Not Found.'
        })
      }
      const incomeData = await binance.getIncome(dynamoUser.api_key, dynamoUser.secret_key, requestBody.timestamp);
      response = {
        data : incomeData
      };
      break;
    case 'futureBalance':
      if(!dynamoUser || !dynamoUser.api_key || !dynamoUser.secret_key) {
        return util.buildResponse(403, {
          message: 'API KEY and SECRET KEY Not Found.'
        })
      }
      const balanceData = await binance.getFutureBalance(dynamoUser.api_key, dynamoUser.secret_key);
      response = {
        data : balanceData
      };
      break;
    case 'getSetting':
      response = await setting.getSetting(requestBody);
      break;
    case 'updateSetting':
      response = await setting.updateSetting(requestBody);
      break;
    default:
      break;
  }


  return util.buildResponse(200, response)
}
async function getUser(user_id){
  const params = {
    TableName: userTable,
    Key: {
      user_id: user_id
    }
  }

  return await dynamodb.get(params).promise().then(response => {
    return response.Item;
  }, error => {
    console.error('There is an error getting user: ', error);
  })
}

module.exports.content = content;