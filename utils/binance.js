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


async function getContractList(api_key, secret_key, time){
  const BASE_URL = 'https://fapi.binance.com';

  // time이 주어지면 해당 월의 시작과 끝 시간을 계산
  let startTime, endTime;
  if (time) {
    const date = new Date(time);
    const now = new Date();
    startTime = new Date(date.getFullYear(), date.getMonth(), 1).getTime(); // 해당 월의 1일
    
    // 현재 달인 경우 현재 시간까지, 아닌 경우 해당 월의 마지막 날까지
    if (date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()) {
      endTime = now.getTime();
    } else {
      endTime = new Date(date.getFullYear(), date.getMonth() + 1, 0).getTime(); // 해당 월의 마지막 날
    }
  } else {
    // time이 주어지지 않으면 현재 월의 데이터를 가져옴
    const now = new Date();
    startTime = new Date(now.getFullYear(), now.getMonth(), 1).getTime(); // 현재 월의 1일
    endTime = now.getTime(); // 현재 시간까지
  }

  //console.log('Fetching data from:', new Date(startTime), 'to:', new Date(endTime));

  const endpoint = '/fapi/v1/userTrades';
  
  let allData = [];
  let currentStartTime = startTime;
  const interval = 7 * 24 * 60 * 60 * 1000; // 7일을 밀리초로 변환
  
  while (currentStartTime < endTime) {
    // 현재 시작 시간에서 7일 후 또는 종료 시간 중 더 작은 값을 현재 종료 시간으로 설정
    const currentEndTime = Math.min(currentStartTime + interval, endTime);
    
    const timestamp = Date.now();
    const queryString = `timestamp=${timestamp}&startTime=${currentStartTime}&endTime=${currentEndTime}`;
    const signature = crypto
      .createHmac('sha256', secret_key)
      .update(queryString)
      .digest('hex');

    const params = {
      params: {
        timestamp: timestamp,
        startTime: currentStartTime,
        endTime: currentEndTime,
        signature: signature
      },
      headers: {
        'X-MBX-APIKEY': api_key,
      }
    };
    
    try {
      const response = await axios.get(BASE_URL+endpoint, params);
      const data = response.data;
      
      if (data.length > 0) {
        allData = [...allData, ...data];
      }
      
      // 다음 7일 간격으로 이동
      currentStartTime = currentEndTime;
      
      // 마지막 간격이면 종료
      if (currentStartTime >= endTime) {
        break;
      }
    } catch (error) {
      console.error('Error fetching contract list:', error.response ? error.response.data : error.message);
      console.error('Full error:', error);
      return [];
    }
  }
  
  return allData;
}

async function getIncome(api_key, secret_key, startTime, endTime){
  const BASE_URL = 'https://fapi.binance.com';
  
  // startTime과 endTime이 주어지지 않은 경우 현재 월의 데이터를 가져옴
  if (!startTime || !endTime) {
    const now = new Date();
    startTime = new Date(now.getFullYear(), now.getMonth(), 1).getTime(); // 현재 월의 1일
    endTime = new Date(now.getFullYear(), now.getMonth() + 1, 0).getTime(); // 현재 월의 마지막 날
  }

  const endpoint = '/fapi/v1/income';
  
  let allData = [];
  let currentStartTime = startTime;
  const limit = 1000; // 바이낸스 API 기본 제한
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000; // 7일을 밀리초로 변환
  
  while (currentStartTime < endTime) {
    // 현재 시작 시간에서 7일 후 또는 종료 시간 중 더 작은 값을 현재 종료 시간으로 설정
    const currentEndTime = Math.min(currentStartTime + SEVEN_DAYS, endTime);
    
    const timestamp = Date.now();
    const queryString = `timestamp=${timestamp}&startTime=${currentStartTime}&endTime=${currentEndTime}&limit=${limit}`;
    const signature = crypto
      .createHmac('sha256', secret_key)
      .update(queryString)
      .digest('hex');

    const params = {
      params: {
        timestamp: timestamp,
        startTime: currentStartTime,
        endTime: currentEndTime,
        limit: limit,
        signature: signature
      },
      headers: {
        'X-MBX-APIKEY': api_key,
      }
    };

    try {
      const response = await axios.get(BASE_URL+endpoint, params);
      const data = response.data;
      
      if (data.length > 0) {
        allData = [...allData, ...data];
      }
      
      // 다음 7일 간격으로 이동
      currentStartTime = currentEndTime;
      
      // 마지막 간격이면 종료
      if (currentStartTime >= endTime) {
        break;
      }
    } catch (error) {
      console.error('Error fetching income data:', error.response ? error.response.data : error.message);
      return [];
    }
  }
  
  return allData;
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