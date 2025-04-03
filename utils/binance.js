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

  const endTime = Date.now();
  // 6개월 전 시간 계산 (밀리초 단위)
  const startTime = endTime - (180 * 24 * 60 * 60 * 1000);
  const endpoint = '/fapi/v1/userTrades';
  
  console.log(`Fetching contract list from ${new Date(startTime).toISOString()} to ${new Date(endTime).toISOString()}`);
  
  let allData = [];
  // 7일 단위로 나누어 조회 (밀리초 단위)
  const interval = 7 * 24 * 60 * 60 * 1000;
  let currentStartTime = startTime;
  const limit = 1000; // 바이낸스 API 기본 제한
  // 요청 간 지연 시간 (밀리초)
  const delayBetweenRequests = 100; // 1초
  
  while (currentStartTime < endTime) {
    // 현재 시작 시간에서 7일 후 또는 종료 시간 중 더 작은 값을 현재 종료 시간으로 설정
    const currentEndTime = Math.min(currentStartTime + interval, endTime);
    
    console.log(`Fetching data from ${new Date(currentStartTime).toISOString()} to ${new Date(currentEndTime).toISOString()}`);
    
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
      
      console.log(`Received ${data.length} records for this interval`);
      
      if (data.length > 0) {
        allData = [...allData, ...data];
      }
      
      // 다음 7일 간격으로 이동
      currentStartTime = currentEndTime;
      
      // 마지막 간격이면 종료
      if (currentStartTime >= endTime) {
        break;
      }
      
      // 요청 간 지연 시간 추가 (마지막 요청 제외)
      if (currentStartTime < endTime) {
        console.log(`Waiting ${delayBetweenRequests}ms before next request...`);
        await new Promise(resolve => setTimeout(resolve, delayBetweenRequests));
      }
    } catch (error) {
      console.error('Error fetching contract list:', error.response ? error.response.data : error.message);
      console.error('Full error:', error);
      
      // API 제한 오류인 경우 더 긴 지연 시간 후 재시도
      if (error.response && error.response.data && error.response.data.code === -1021) {
        console.log('Rate limit exceeded. Waiting 60 seconds before retrying...');
        await new Promise(resolve => setTimeout(resolve, 60000));
        // 현재 간격을 다시 시도
        continue;
      }
      
      return [];
    }
  }
  
  console.log(`Total records fetched: ${allData.length}`);
  return allData;
}

async function getIncome(api_key, secret_key){
  const BASE_URL = 'https://fapi.binance.com';
  const endTime = Date.now();
  // 3개월 전 시간 계산 (밀리초 단위)
  const startTime = endTime - (90 * 24 * 60 * 60 * 1000);
  const endpoint = '/fapi/v1/income';
  
  let allData = [];
  let currentStartTime = startTime;
  const limit = 1000; // 바이낸스 API 기본 제한
  
  while (currentStartTime < endTime) {
    const timestamp = Date.now();
    const queryString = `timestamp=${timestamp}&startTime=${currentStartTime}&endTime=${endTime}&limit=${limit}`;
    const signature = crypto
      .createHmac('sha256', secret_key)
      .update(queryString)
      .digest('hex');

    const params = {
      params: {
        timestamp: timestamp,
        startTime: currentStartTime,
        endTime: endTime,
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
      
      if (data.length === 0) {
        break; // 더 이상 데이터가 없으면 종료
      }
      
      allData = [...allData, ...data];
      
      // 마지막으로 받은 데이터의 시간 + 1ms를 다음 시작점으로 설정
      if (data.length < limit) {
        break; // 마지막 페이지라면 종료
      } else {
        // 받은 마지막 데이터의 시간을 기준으로 다음 요청의 시작 시간 설정
        const lastTimestamp = data[data.length - 1].time;
        currentStartTime = lastTimestamp + 1;
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