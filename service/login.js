const AWS = require('aws-sdk');
AWS.config.update({
  region: 'ap-northeast-2'
})
const util = require('../utils/util');
const auth = require('../utils/auth');
const  bcrypt = require('bcryptjs')

const dynamodb = new AWS.DynamoDB.DocumentClient();
const userTable = 'User';

async function login(user) {
  const user_id = user.user_id;
  const password = user.password;
  if(!user || !user_id || !password) {
    return util.buildResponse(401, {
      message: 'user_id and password are required'
    })
  }

  const dynamoUser = await getUser(user_id.toLowerCase().trim());
  if (!dynamoUser || !dynamoUser.user_id) {
    return util.buildResponse(403, {
      message: 'user does not exist'
    })
  }

  if (!bcrypt.compareSync(password, dynamoUser.password)) {
    return util.buildResponse(403, {
      message: 'password is incorrect'
    })
  }

  const userInfo = {
    user_id: dynamoUser.user_id,
    name: dynamoUser.name
  }
  const token= auth.generateToken(userInfo)
  const response = {
    user: userInfo,
    token: token,
  }

    return util.buildResponse(200, response);
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

module.exports.login = login;