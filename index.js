const { google } = require('googleapis');
const https = require('https');

const PROJECT_ID = 'alln-5b98f';
const HOST = 'fcm.googleapis.com';
const PATH = '/v1/projects/' + PROJECT_ID + '/messages:send';
const MESSAGING_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';
const SCOPES = [MESSAGING_SCOPE];
 
 function getAccessToken() {
  return new Promise(function(resolve, reject) {
    const key = require('./allin_service.json');
    const jwtClient = new google.auth.JWT(
      key.client_email,
      null, 
      key.private_key,
      SCOPES,
      null
    );
    jwtClient.authorize(function(err, tokens) {
      if (err) {
        reject(err);
        return;
      }
      resolve(tokens.access_token);
    });
  }); 
}

function sendFcmMessage(fcmMessage) {
    getAccessToken().then(function(accessToken) {
      const options = {
        hostname: HOST,
        path: PATH,
        method: 'POST',
        // [START use_access_token]
        headers: {
          'Authorization': 'Bearer ' + accessToken
        }
        // [END use_access_token] 
      };
  
      const request = https.request(options, function(resp) {
        resp.setEncoding('utf8');
        resp.on('data', function(data) {
          console.log('Message sent to Firebase for delivery, response:');
          console.log(data);
        });
      });
  
      request.on('error', function(err) {
        console.log('Unable to send message to Firebase');
        console.log(err);
      });
  
      request.write(JSON.stringify(fcmMessage));
      request.end();
    });
  }



function buildCommonMessage() {
const messageData = require('./device_token.json');
  return {
    'message': {
      'token': messageData.device_token,
      'notification': { 
        'title': messageData.chat_name,
        'body': messageData.message,
      },
      "android":{ 
        "ttl":"86400s",
        "notification":{
          "click_action":"OPEN_ACTIVITY_1"
        }
      },
      "apns": {
        "headers": {
          "apns-priority": "5",
        },
        "payload": {
          "aps": {
            "alert": {
                'title': messageData.chat_name,
                'body': messageData.message,
            },
            "data": { 
                'isPersonal': messageData.isPersonal,
                'chat_id': messageData.chat_id,
            }
          }
        }
      }
    }
  };
}
 

sendFcmMessage(buildCommonMessage());