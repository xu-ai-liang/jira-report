const JiraClient = require('jira-connector');
const JiraApi = require('jira-client');
const fs = require('fs');

// process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

const config = {}
config.consumerKey = "OauthKey";
config.consumerPrivateKeyFile = "./config/jira_privatekey.pcks8"
config.token = 'UUZfF5ru1y4ZwFeNPdfnU935QRMqYNCD';
config.token_secret = 'eLHjHIRVSQGR4DhIbIA1GLFeAALGIrcA';
config.token_access = 'erQd5SDKug3D6krClL3KHndfTQzWlw81';
const privateKeyData = fs.readFileSync(config["consumerPrivateKeyFile"], "utf8");

function main() {
  JiraClient.oauth_util.getAuthorizeURL({
    protocol: 'http',
    host: 'jira.caicloud.xyz',
    oauth: {
      consumer_key: "OauthKey",
      private_key: privateKeyData
    }
  }, function (err, oauth) {
    console.log(oauth);
  });
}

function main2() {
  JiraClient.oauth_util.swapRequestTokenWithAccessToken(
    {
      protocol: 'http',
      host: 'jira.caicloud.xyz',
      oauth: {
        token: config.token,
        token_secret: config.token_secret,
        oauth_verifier: "FHhsGl",
        consumer_key: "OauthKey",
        private_key: privateKeyData
      }
    },
    function (error, accessToken) {
      console.log(accessToken); // erQd5SDKug3D6krClL3KHndfTQzWlw81
    });
}

async function main3() {
  var jira = new JiraClient({
    protocol: 'http',
    host: 'jira.caicloud.xyz',
    oauth: {
      token: config.token_access,
      token_secret: config.token_secret,
      oauth_verifier: "FHhsGl",
      consumer_key: "OauthKey",
      private_key: privateKeyData
    }
  });
  const issue = await jira.issue.getIssue({ issueKey: 'CPS-1852' });
  console.log(issue.fields.timetracking);

  const versions = await jira.project.getVersions({ projectIdOrKey: "CPS" });
  const components = await jira.project.getComponents({ projectIdOrKey: "CPS" });
  console.log(components);

  // projects
  // issues,
  // versions,
  // components,
}

main3();
