const jwt = require('jsonwebtoken');

function generateToken(userInfo) {
  if(!userInfo) {
    return null;
  }

  return jwt.sign(userInfo, process.env.JWT_SECRET, {
    expiresIn: '1h'
  })
}

function verifyToken(user_id, token){
  return jwt.verify(token, process.env.JWT_SECRET, (error, response) => {
    if (error) {
      return {
        verified: false,
        message: 'invalid token'
      }
    }

    if (response.user_id !== user_id){
      return {
        verified: false,
        message: 'invalid user'
      }
    }

    return {
      verified: true,
      message: 'verified'
    }
  })
}

module.exports.generateToken = generateToken;
module.exports.verifyToken = verifyToken;