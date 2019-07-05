var express = require('express'),
  http = require('http'),
  OAuth = require('oauth').OAuth,
  fs = require('fs');
const logger = require('morgan');
const colors = require('colors/safe');

const app = express();
// app.configure('development', function () {
//   app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
//   app.use(express.logger());
//   app.use(express.cookieParser());
//   app.use(express.session({ secret: "ssshhhh!" }));
// });

// var config = require("./config");
var config = {}
config.consumerKey = "OauthKey";
config.consumerPrivateKeyFile = "./config/jira_privatekey.pcks8"
var privateKeyData = fs.readFileSync(config["consumerPrivateKeyFile"], "utf8");

var consumer =
  new OAuth("https://jira.caicloud.xyz/plugins/servlet/oauth/request-token",
    "https://jira.caicloud.xyz/plugins/servlet/oauth/access-token",
    config["consumerKey"],
    "",
    "1.0",
    "http://127.0.0.1:8080/sessions/callback",
    "RSA-SHA1",
    null,
    privateKeyData);

// app.dynamicHelpers({
//   session: function (request, response) {
//     return request.session;
//   }
// });

let httpLogFormat = `${colors.yellow('[:mydate]')}  ${colors.white(
  '(:method)'
)} :url ${colors.green(':status')} :response-time ms :res[content-length]`;
app.use(logger(httpLogFormat));

app.use('/', function (request, response) {
  response.send('Hello World');
});

app.use('/sessions/connect', function (request, response) {
  consumer.getOAuthRequestToken(
    function (error, oauthToken, oauthTokenSecret, results) {
      if (error) {
        console.log(error.data);
        response.send('Error getting OAuth access token');
      }
      else {
        request.session.oauthRequestToken = oauthToken;
        request.session.oauthRequestTokenSecret = oauthTokenSecret;
        response.redirect("https://jira.caicloud.xyz/plugins/servlet/oauth/authorize?oauth_token=" + request.session.oauthRequestToken);
      }
    }
  )
});

app.use('/sessions/callback', function (request, response) {
  consumer.getOAuthAccessToken(
    request.session.oauthRequestToken,
    request.session.oauthRequestTokenSecret,
    request.query.oauth_verifier,
    function (error, oauthAccessToken, oauthAccessTokenSecret, results) {
      if (error) {
        console.log(error.data);
        response.send("error getting access token");
      }
      else {
        request.session.oauthAccessToken = oauthAccessToken;
        request.session.oauthAccessTokenSecret = oauthAccessTokenSecret;
        consumer.get("https://jira.caicloud.xyz/rest/api/latest/issue/JRADEV-8110.json",
          request.session.oauthAccessToken,
          request.session.oauthAccessTokenSecret,
          "application/json",
          function (error, data, resp) {
            console.log(data);
            data = JSON.parse(data);
            response.send("I am looking at: " + data["key"]);
          }
        );
      }
    }
  )
});

var server = http.createServer(app);
server.listen(8080);

module.exports = app;