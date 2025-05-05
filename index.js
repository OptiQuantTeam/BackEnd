const registerService = require('./service/register')
const loginService = require('./service/login')
const verifyService =require('./service/verify')
const contentService = require('./service/content')
const s3Service = require('./service/s3')
const util = require('./utils/util')

const registerPath = '/register';
const loginPath = '/login';
const verifyPath = '/verify';
const testPath = '/test';
const contentPath = '/content';
const rootPath = '/';


exports.handler = async (event) => {
  console.log('Request Event', event);
  let response;

  switch(true){
    case event.httpMethod === 'GET' && event.path === rootPath:
      const homeBody = JSON.parse(event.body)
      response = await s3Service.getJsonFile(homeBody);
      break;
    case event.httpMethod === 'GET' && event.path === testPath:
      response = util.buildResponse(200);
      break;
    case event.httpMethod === 'POST' && event.path === registerPath:
      const registerBody = JSON.parse(event.body)
      response = await registerService.register(registerBody);
      break;
    case event.httpMethod === 'POST' && event.path === loginPath:
      const loginBody = JSON.parse(event.body)
      response = await loginService.login(loginBody);
      break;
    case event.httpMethod === 'POST' && event.path === verifyPath:
      const verifyBody = JSON.parse(event.body)
      response =  await verifyService.verify(verifyBody);
      break;
    case event.httpMethod === 'POST' && event.path === contentPath:
      const contentBody = JSON.parse(event.body)
      response = await contentService.content(contentBody);
      break;
    default:
      response = util.buildResponse(404, '404 Not Found');
  }
  
  return response;
};

