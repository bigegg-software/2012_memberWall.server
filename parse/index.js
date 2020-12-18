const ParseServer = require('parse-server').ParseServer;
const S3Adapter = require('@bigegg/s3-files-adapter');
const AWS = require("aws-sdk");



const databaseUri = process.env.PARSE_SERVER_DATABASE_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

let s3options = undefined;
if (process.env.S3_BUCKET) {
  s3options = {
    bucket: process.env.S3_BUCKET,
    baseUrl: process.env.S3_BASEURL, 
    region: process.env.S3_REGION, 
    directAccess: true,
    s3overrides: {
      accessKeyId: process.env.S3_ACCESS_KEY, 
      secretAccessKey: process.env.S3_SECRET_KEY, 
      endpoint: new AWS.Endpoint(process.env.S3_ENDPOINT) 
    }
  };
}

const options = {
  databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
  cloud: process.env.PARSE_SERVER_CLOUD || __dirname + '/cloud/main.js',
  appId: process.env.PARSE_SERVER_APPLICATION_ID || 'myAppId',
  masterKey: process.env.PARSE_SERVER_MASTER_KEY || 'myMasterKey', //Add your master key here. Keep it secret!
  serverURL: process.env.PARSE_PUBLIC_SERVER_URL || 'http://localhost:1337/api/1',  // Don't forget to change to https if needed
  maxUploadSize: process.env.PARSE_SERVER_MAX_UPLOAD_SIZE,
  cacheMaxSize: parseInt(process.env.PARSE_SERVER_CACHE_MAX_SIZE),
  publicServerURL: process.env.PARSE_PUBLIC_SERVER_URL || 'http://localhost:1337/api/1',
  javascriptKey: process.env.PARSE_PUBLIC_JAVASCRIPTKEY,
  allowClientClassCreation: false,
  // filesAdapter: new GridStoreAdapter(process.env.PARSE_SERVER_DATABASE_URI) // For default setting. GridFS
  filesAdapter: (s3options) ? new S3Adapter(s3options) : undefined,
  masterKeyIps:[],
  protectedFields: {
    ToDo: {
      "*": ["password"],
    }
  },
  
};

console.log('s3 options', s3options);
console.log('parse options', options);

module.exports = new ParseServer(options);