const AWS = require('aws-sdk'); 
AWS.config.update({
  region: 'ap-northeast-2'
})
const util = require('./util');
const auth = require('./auth');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const userTable = 'User';

async function getSetting(requestBody) {
  const user_id = requestBody.user_id;
  const token = requestBody.token;
  const verification = auth.verifyToken(user_id, token);
  if (!verification.verified){
    return util.buildResponse(401, verification)
  }

  const dynamoUser = await readDB(user_id.toLowerCase().trim());
  if(!dynamoUser || !dynamoUser.user_id){
    return util.buildResponse(403, {
      message: 'User not found.'
    })
  }

  const userInfo = {
    user_id: dynamoUser.user_id,
    api_key: dynamoUser.api_key,
    secret_key: dynamoUser.secret_key,
    name: dynamoUser.name,
    email: dynamoUser.email,
    leverage: dynamoUser.leverage,
    ratio: dynamoUser.ratio,
    sl: dynamoUser.sl,
    tp: dynamoUser.tp,
    slack_channel: dynamoUser.slack_channel,
    slack_token: dynamoUser.slack_token,
    slack_user: dynamoUser.slack_user,
    type: dynamoUser.type
  }

  const response = {
    user: userInfo
  }

  return response;
}

async function updateSetting(requestBody) {
  const user_id = requestBody.user_id;
  const token = requestBody.token;
  const verification = auth.verifyToken(user_id, token);
  if (!verification.verified){
    return util.buildResponse(401, verification)
  }

  const updateData = requestBody.data;
  const result = await updateDB(user_id, updateData);

  if (!result){
    return util.buildResponse(503, {
      message: 'Server Error, try again later'
    })
  }

  const response = {
    message: 'User Info Updated',
    updateAttributes: result.Attributes
  }

  return response;
}

async function readDB(user_id){
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

async function updateDB(user_id, updateData){
  const params = {
    TableName: userTable,
    Key: {
      user_id: user_id
    },
    UpdateExpression: 'set #api_key = :api_key, \
                            #secret_key = :secret_key, \
                            #name = :name, \
                            #email = :email, \
                            #leverage = :leverage, \
                            #ratio = :ratio, \
                            #sl = :sl, \
                            #tp = :tp, \
                            #slack_channel = :slack_channel, \
                            #slack_token = :slack_token, \
                            #slack_user = :slack_user, \
                            #type = :type',
    ExpressionAttributeNames: {
      '#api_key': 'api_key',
      '#secret_key': 'secret_key',
      '#name': 'name',
      '#email': 'email',
      '#leverage': 'leverage',
      '#ratio': 'ratio',
      '#sl': 'sl',
      '#tp': 'tp',
      '#slack_channel': 'slack_channel',
      '#slack_token': 'slack_token',
      '#slack_user': 'slack_user',
      '#type': 'type'
    },
    ExpressionAttributeValues: {
      ':api_key': updateData.api_key,
      ':secret_key': updateData.secret_key,
      ':name': updateData.name,
      ':email': updateData.email,
      ':leverage': updateData.leverage,
      ':ratio': updateData.ratio,
      ':sl': updateData.sl,
      ':tp': updateData.tp,
      ':slack_channel': updateData.slack_channel,
      ':slack_token': updateData.slack_token,
      ':slack_user': updateData.slack_user,
      ':type': updateData.type
    },
    ReturnValues: 'UPDATED_NEW'
  };


  return await dynamodb.update(params).promise().then(response => {
    return response;
  }, error => {
    console.error('There is an error updating user: ', error);
    return null;
  })
}

module.exports.getSetting = getSetting;
module.exports.updateSetting = updateSetting;