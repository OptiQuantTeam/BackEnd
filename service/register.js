const AWS = require('aws-sdk');
AWS.config.update({
  region: 'ap-northeast-2'
})
const util = require('../utils/util');
const  bcrypt = require('bcryptjs')

const dynamodb = new AWS.DynamoDB.DocumentClient();
const userTable = 'User';

async function register(userInfo) {
  const user_id = userInfo.user_id;
  const email = userInfo.email;
  const name =userInfo.name;
  const password = userInfo.password;
  if(!name || !user_id || !email || !password){
    return util.buildResponse(401, {
      message: 'All fields are required'
    })
  }

  const dynamoUser = await getUser(user_id);
  if(dynamoUser && dynamoUser.user_id){
    return util.buildResponse(401, {
      message: 'user_id already exists in our database.'
    })
  }

  const encryptedPW = bcrypt.hashSync(password.trim(), 10);
  const user = {
    user_id: user_id.toLowerCase().trim(),
    email: email,
    name: name,
    password: encryptedPW
  }

  const saveUserResponse = await saveUser(user);
  if (!saveUserResponse){
    return util.buildResponse(503, {
      message: 'Server Error, try again later'
    })
  }

  return util.buildResponse(200, {user_id: user_id})
}

async function getUser(user_id){
  const params = {
    TableName: userTable,
    key: {
      user_id: user_id
    }
  }

  return await dynamodb.get(params).promise().then(response => {
    return response.Item;
  }, error => {
    console.error('There is an error getting user: ', error);
  })
}

async function saveUser(user){
  const params = {
    TableName: userTable,
    Item: user
  }
  return await dynamodb.put(params).promise().then(() => {
    return true;
  }, error => {
    console.error('There is an error saving user: ',error)
  })
}

module.exports.register = register;