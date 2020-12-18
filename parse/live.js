const ParseServer = require('parse-server').ParseServer;
module.exports = (httpServer) =>{
    ParseServer.createLiveQueryServer(httpServer, JSON.parse(process.env.PARSE_SERVER_LIVE_QUERY));
}

