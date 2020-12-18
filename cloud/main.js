require('./model')
require('./app')
require('./model')

Parse.Cloud.define('ping', async (req) => {
  return 'pong';
})
