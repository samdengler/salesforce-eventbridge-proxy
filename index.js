const SALESFORCE_LOGIN_URL = process.env.SALESFORCE_LOGIN_URL;
const SALESFORCE_CLIENT_ID = process.env.SALESFORCE_CLIENT_ID;
const SALESFORCE_CLIENT_SECRET = process.env.SALESFORCE_CLIENT_SECRET;
const SALESFORCE_USERNAME = process.env.SALESFORCE_USERNAME;
const SALESFORCE_PASSWORD = process.env.SALESFORCE_PASSWORD;
const SALESFORCE_TOPIC = process.env.SALESFORCE_TOPIC;
const EVENT_BUS = process.env.EVENT_BUS;

const AWS = require('aws-sdk');
const eventbridge = new AWS.EventBridge({region: process.env.AWS_REGION});

const jsforce = require('jsforce');
const conn = new jsforce.Connection({
  oauth2: {
    loginUrl: SALESFORCE_LOGIN_URL,
    clientId: SALESFORCE_CLIENT_ID,
    clientSecret: SALESFORCE_CLIENT_SECRET,
    redirectUri: 'http://localhost:3000/oauth/_callback',
  }
});

parseMessage = (message) => {
  return {
    source: message.payload.Source__c,
    detailType: message.payload.DetailType__c,
    detail: JSON.stringify(message),
  };
};

publish = async(event) => {
  console.log(event);
  return eventbridge.putEvents({
    Entries: [
      {
        EventBusName: EVENT_BUS,
        Source: event.source,
        DetailType: event.detailType,
        Detail: event.detail,
      }
    ]
  }).promise();
};

subscribe = async(conn, topic) => {
  conn.streaming.topic(topic).subscribe(async function (message) {
    console.log(message);
    let event = parseMessage(message);
    await publish(event);
  });
};

main = async() => {
  try {
    await conn.login(SALESFORCE_USERNAME, SALESFORCE_PASSWORD);
    subscribe(conn, SALESFORCE_TOPIC);
  } catch (err) {
    console.error(err);
  }
};

main();