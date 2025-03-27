const crypto = require('crypto');
const axios = require('axios');
// 가져와야할 것
// - 거래 목록
// - 자산 변동
// - 
//
const BASE_URL = 'https://api.binance.com';

async function getBinance(api_key, secret_key) {

  const timestamp = Date.now();
  const endpoint = '/fapi/v1/income';
  const queryString = `timestamp=${timestamp}`;
  
  const signature = crypto
  .createHmac('sha256', secret_key)
  .update(queryString)
  .digest('hex');

  
  
  const params = {
    params: {
      timestamp: timestamp,
      signature: signature
    },
    headers: {
      'X-MBX-APIKEY': api_key, // API Key 추가
    }
  }
  return await axios.get(BASE_URL+endpoint, params).then((response) => {
    console.log(response);
    return response.data;  // response 안에 있는 데이터만 반환하게 변경할 예정
  }).catch((error) => {
    console.error('Error fetching user info:', error.response ? error.response.data : error.message);
    // 에러 발생시 특정 코드를 보내서 Content.js에서 처리하게 변경할 예정
  })  
}


async function getContractList(api_key, secret_key){
  const BASE_URL = 'https://fapi.binance.com';

  const timestamp = Date.now();
  const endpoint = '/fapi/v1/userTrades';
  const queryString = `timestamp=${timestamp}`;
  const signature = crypto
  .createHmac('sha256', secret_key)
  .update(queryString)
  .digest('hex');

  const params = {
      params: {
        timestamp: timestamp,
        signature: signature
      },
      headers: {
        'X-MBX-APIKEY': api_key, // API Key 추가
      }
    }
    return await axios.get(BASE_URL+endpoint, params).then((response) => {
      console.log(response);
      return response.data;  // response 안에 있는 데이터만 반환하게 변경할 예정
    }).catch((error) => {
      console.error('Error fetching user info:', error.response ? error.response.data : error.message);
      // 에러 발생시 특정 코드를 보내서 Content.js에서 처리하게 변경할 예정
    })  
}

async function getIncome(api_key, secret_key){
  const BASE_URL = 'https://fapi.binance.com';
  const timestamp = Date.now();
  const endpoint = '/fapi/v1/income';
  const queryString = `timestamp=${timestamp}`;
  const signature = crypto
  .createHmac('sha256', secret_key)
  .update(queryString)
  .digest('hex');

  const params = {
      params: {
          timestamp: timestamp,
          signature: signature
      },
      headers: {
          'X-MBX-APIKEY': api_key, // API Key 추가
      }
  }
  return await axios.get(BASE_URL+endpoint, params).then((response) => {
    console.log(response.data);
    return response.data;  // response 안에 있는 데이터만 반환하게 변경할 예정
  }).catch((error) => {
    console.error('Error fetching user info:', error.response ? error.response.data : error.message);
    // 에러 발생시 특정 코드를 보내서 Content.js에서 처리하게 변경할 예정
  })  
}

async function getFutureBalance(api_key, secret_key){
  const BASE_URL = 'https://fapi.binance.com';
  const timestamp = Date.now();
  const endpoint = '/fapi/v3/balance';
  const queryString = `timestamp=${timestamp}`;
  const signature = crypto
  .createHmac('sha256', secret_key)
  .update(queryString)
  .digest('hex');

  const params = {
    params: {
        timestamp: timestamp,
        signature: signature  
    },
    headers: {
        'X-MBX-APIKEY': api_key, // API Key 추가
    }
  }
  return await axios.get(BASE_URL+endpoint, params).then((response) => {
    console.log(response.data);
    return response.data;  // response 안에 있는 데이터만 반환하게 변경할 예정
  }).catch((error) => {
    console.error('Error fetching user info:', error.response ? error.response.data : error.message);
    // 에러 발생시 특정 코드를 보내서 Content.js에서 처리하게 변경할 예정
  })
}

module.exports.getBinance = getBinance;
module.exports.getContractList = getContractList;
module.exports.getIncome = getIncome;
module.exports.getFutureBalance = getFutureBalance;