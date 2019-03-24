/**
 * Copyright 2019 devsunset. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
//////////////////////////////////////////////////////////////////////////////////////
'use strict';
//////////////////////////////////////////////////////////////////////////////////////
// LOG PRINT FLAG
const LOG_FLAG = true;

// [START import]
// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();

// Get the `FieldValue` object
var FieldValue = require('firebase-admin').firestore.FieldValue;
// [END import]
//////////////////////////////////////////////////////////////////////////////////////

// Common Functions

//■■■ json object concat
function jsonConcat(o1, o2) {
  for (var key in o2) {
   o1[key] = o2[key];
  }
  return o1;
 }

//■■■ request get parameter Object Type
function getParamsObj(req){
  var params = req.query;
  params = jsonConcat(params,req.params);
  params = jsonConcat(params,req.body);
  params.Z_LAST_ACCESS_TIME = FieldValue.serverTimestamp();
  return params;
}

//■■■ request get parameter Json Type
function getParamsJson(req){
  var params = req.query;
  params = jsonConcat(params,req.params);
  params = jsonConcat(params,req.body);
  return JSON.parse(JSON.stringify(params));
}

//■■■ common return vo
function setResult(call_function,result_code,result_message,result_data){
  var result = new Object();
  result.CALL_FUNCTION = call_function;
  result.RESULT_CODE = result_code;
  result.RESULT_MESSAGE = result_message;
  if(result_data ==''){
    var listData = new Array();
    var temp = new Object();
    temp.EMPTY_DATA='Y';
    listData.push(temp);
    result.RESULT_DATA = listData;	
  }else{
    result.RESULT_DATA = result_data;	
  }
  return JSON.parse(JSON.stringify(result));
}

//////////////////////////////////////////////////////////////////////////////////////

// Biz Logic Process Functions

 // App Notice
exports.appNotice = functions.https.onRequest(async (req, res) => { 
   if(LOG_FLAG){
      var params = getParamsObj(req);
      console.log('----------[[appNotice]]---------- : '+ JSON.stringify(params));      
   }  
   
  var listData = new Array();
  
  var dataRef = admin.firestore().collection('APP_NOTICE');

  await dataRef.where('NOTICE_STATUS', '==', 'A').get()
    .then(snapshot => {
      snapshot.forEach(doc => {                
        listData.push(doc.data());
      });
    })
    .catch(err => {     
      console.log('Error getting documents', err);      
      res.json(setResult("appNotice","E",'Error getting documents : '+err.stack,''));    
    });

  try{
      await admin.firestore().collection('APP_USERS').doc(params.APP_ID).update(    
        { 
          Z_LAST_ACCESS_TIME : params.Z_LAST_ACCESS_TIME
        }
      );      
    }catch(err){
      console.error(err);      
    }

   res.json(setResult("appNotice","S","",listData));  
});

// App Info Init
exports.appInfoInit = functions.https.onRequest(async (req, res) => { 
	if(LOG_FLAG){
	  var params = getParamsObj(req);
	  console.log('----------[[appInfoInit]]---------- : '+ JSON.stringify(params));      
	}  

	params.APP_STATUS = "A";  
	params.X_BLACK_LIST_COUNT = "0";
	params.Z_INIT_ACCESS_TIME = params.Z_LAST_ACCESS_TIME;

	try{
	  await admin.firestore().collection('APP_USERS').doc(params.APP_ID).set(params);     
	  res.json(setResult("appInfoInit","S",`DOC ID: ${params.APP_ID} created.`,''));   
	}catch(err){
	  console.error(err);
	  res.json(setResult("appInfoInit","E",err.stack,``));       
	}
});

// App Info Update
exports.appInfoUpdate = functions.https.onRequest(async (req, res) => { 
  if(LOG_FLAG){
     var params = getParamsObj(req);
     console.log('----------[[appInfoUpdate]]---------- : '+ JSON.stringify(params));      
  }  

  params.APP_STATUS = "A";  
  params.Z_LAST_ACCESS_TIME = params.Z_LAST_ACCESS_TIME;

  try{
	  await admin.firestore().collection('APP_USERS').doc(params.APP_ID).set(params);     
	  res.json(setResult("appInfoUpdate","S",`DOC ID: ${params.APP_ID} updated.`,''));   
	}catch(err){
	  console.error(err);
	  res.json(setResult("appInfoUpdate","E",err.stack,``));       
	}
  
  /*
  try{
    await admin.firestore().collection('APP_USERS').doc(params.APP_ID).update(    
      { 
         APP_KEY : params.APP_KEY
        ,APP_PHONE : params.APP_PHONE
        ,APP_VER : params.APP_VER
        ,COUNTRY : params.COUNTRY
        ,COUNTRY_NAME : params.COUNTRY_NAME
        ,GENDER : params.GENDER
        ,LANG : params.LANG        
        ,SET_ALARM_YN : params.SET_ALARM_YN
        ,SET_ALARM_NOTI_YN : params.SET_ALARM_NOTI_YN
        ,SET_ALARM_POPUP_YN : params.SET_ALARM_POPUP_YN
        ,SET_BYE_CONFIRM_YN : params.SET_BYE_CONFIRM_YN
        ,SET_LOCK_PWD : params.SET_LOCK_PWD
        ,SET_LOCK_YN : params.SET_LOCK_YN
        ,SET_NEW_RECEIVE_YN : params.SET_NEW_RECEIVE_YN
        ,SET_SEND_COUNTRY : params.SET_SEND_COUNTRY
        ,SET_SEND_GENDER : params.SET_SEND_GENDER
        ,SET_SEND_LIST_HIDE_YN : params.SET_SEND_LIST_HIDE_YN
        ,Z_LAST_ACCESS_TIME : params.Z_LAST_ACCESS_TIME
      }
    );
    res.json(setResult("appInfoUpdate","S",`DOC ID: ${params.APP_ID} updated.`,'')); 
  }catch(err){
    console.error(err);
    res.json(setResult("appInfoUpdate","E",err.stack,``));    
  }
  */
});

// Send Message
exports.sendMessage = functions.https.onRequest(async (req, res) => { 
   if(LOG_FLAG){
      var params = getParamsObj(req);
      console.log('----------[[sendMessage]]---------- : '+ JSON.stringify(params));      
   }  
 
    var listData = new Array();

    var dataRef = admin.firestore().collection('APP_USERS');

    //await dataRef.where('APP_STATUS', '==', 'A').orderBy("Z_LAST_ACCESS_TIME", "desc").limit(1000).get()
    await dataRef.where('APP_STATUS', '==', 'A').get()
      .then(snapshot => {
        snapshot.forEach(doc => {       
          if (params.FROM_APP_ID != doc.data().APP_ID && params.FROM_APP_KEY != doc.data().FROM_APP_KEY){
              listData.push(doc.data());
          }   
        });
      })
      .catch(err => {     
        console.log('Error getting documents', err);      
      });
  
     if(listData.length > 0 ){
         //Build the message payload and send the message
          var payload = {
            notification: {
              title: 'Received Message',
              body: ''
            },
            data: {
              ATX_ID: params.ATX_ID,
              ATX_LOCAL_TIME: params.ATX_LOCAL_TIME,
              ATX_STATUS: params.ATX_STATUS,
              FROM_APP_ID: params.FROM_APP_ID,
              FROM_APP_KEY:  params.FROM_APP_KEY,
              FROM_COUNTRY:  params.FROM_COUNTRY,
              FROM_COUNTRY_NAME:  params.FROM_COUNTRY_NAME,
              FROM_GENDER:  params.FROM_GENDER,
              FROM_LANG:  params.FROM_LANG,
              LAST_TALK_TEXT: params.LAST_TALK_TEXT,     
              TALK_ID: params.TALK_ID,   
              TALK_TYPE: params.TALK_TYPE,
              TO_APP_ID: listData[0].APP_ID,
              TO_APP_KEY: listData[0].APP_KEY,
              TO_COUNTRY: listData[0].COUNTRY,
              TO_COUNTRY_NAME: listData[0].COUNTRY_NAME,
              TO_GENDER: listData[0].GENDER,
              TO_LANG: listData[0].LANG
            }
          };

          // Create an options object that contains the time to live for the notification and the priority
          const options = {
              priority: "high",
              timeToLive: 60 * 60 * 24
          };
            
          // FROM
          await admin.messaging().sendToDevice(params.FROM_APP_KEY, payload,options)
            .then(function(response) {  
                  console.log("Successfully sent message:", response);
              })
              .catch(function(error) {
                  console.log("Error sending message:", error);
              });  
          
          // TO
          await admin.messaging().sendToDevice(listData[0].APP_KEY, payload,options)
          .then(function(response) {
                console.log("Successfully sent message:", response);
                res.json(setResult("sendMessage","S",'',''));  
            })
            .catch(function(error) {
              console.log("Error sending message:", error);
              res.json(setResult("sendMessage","E",error,''));  
            });  
     }else{
        res.json(setResult("sendMessage","E","TARGET_NO_DATA",''));  
     }   

});

// Reply Message
exports.replyMessage = functions.https.onRequest(async (req, res) => { 
   if(LOG_FLAG){
      var params = getParamsObj(req);
      console.log('----------[[replyMessage]]---------- : '+ JSON.stringify(params));      
   }  
   res.json(setResult("replyMessage","S",`To-Do`,''));   
});

// Good Bye Message
exports.goodbyeMessage = functions.https.onRequest(async (req, res) => { 
   if(LOG_FLAG){
      var params = getParamsObj(req);
      console.log('----------[[goodbyeMessage]]---------- : '+ JSON.stringify(params));      
   }  
   res.json(setResult("goodbyeMessage","S",`To-Do`,''));   
});

// Get Image Data
exports.getImageData = functions.https.onRequest(async (req, res) => { 
   if(LOG_FLAG){
      var params = getParamsObj(req);
      console.log('----------[[getImageData]]---------- : '+ JSON.stringify(params));      
   }  
   res.json(setResult("getImageData","S",`To-Do`,''));   
});

// Get Voice Data
exports.getVoiceData = functions.https.onRequest(async (req, res) => { 
   if(LOG_FLAG){
      var params = getParamsObj(req);
      console.log('----------[[getVoiceData]]---------- : '+ JSON.stringify(params));      
   }  
   res.json(setResult("getVoiceData","S",`To-Do`,''));   
});

// Request Black List
exports.requstBlackList = functions.https.onRequest(async (req, res) => { 
   if(LOG_FLAG){
      var params = getParamsObj(req);
      console.log('----------[[requstBlackList]]---------- : '+ JSON.stringify(params));      
   }  
   res.json(setResult("requstBlackList","S",`To-Do`,''));   
});

// Request Voc
exports.requestVoc = functions.https.onRequest(async (req, res) => { 
   if(LOG_FLAG){
      var params = getParamsObj(req);
      console.log('----------[[requestVoc]]---------- : '+ JSON.stringify(params));      
   }  
   res.json(setResult("requestVoc","S",`To-Do`,''));   
});

// Error Stack Trace
exports.errorStackTrace = functions.https.onRequest(async (req, res) => { 
   if(LOG_FLAG){
      var params = getParamsObj(req);
      console.log('----------[[errorStackTrace]]---------- : '+ JSON.stringify(params));      
   }  
   res.json(setResult("errorStackTrace","S",`To-Do`,''));   
});

//////////////////////////////////////////////////////////////////////////////////////

/* 
### Sample Process Functions && Cloud Filestore sample ###

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions
exports.helloWorld = functions.https.onRequest((request, response) => {
 response.send("Hello World!");
});

// Sample functions
exports.sample = functions.https.onRequest((req, res) => {
  res.status(200).send(`<!doctype html>
    <head>
      <title>Simple Random Chat</title>
    </head>
    <body>
      Simple Random Chat 
    </body>
  </html>`);
});

// Create Sample Functions
exports.create = functions.https.onRequest(async (req, res) => {    
  var params = getParamsObj(req);
  console.log('----------[[create]]---------- : '+ JSON.stringify(params));     
  
  params.APP_STATUS = "A";  
  params.X_BLACK_LIST_COUNT = "0";
  params.Z_INIT_ACCESS_TIME = params.Z_LAST_ACCESS_TIME;

  try{
    await admin.firestore().collection('SAMPLE').doc(params.APP_ID).set(params);     
    res.json(setResult("create","S",`DOC ID: ${params.APP_ID} created.`,''));   
  }catch(err){
    console.error(err);
    res.json(setResult("create","E",err.stack,``));       
  }
});

 // Read Sample Functions (To-Do)
exports.read = functions.https.onRequest(async (req, res) => {    
  var params = getParamsObj(req);
  console.log('----------[[read]]---------- : '+ JSON.stringify(params));    

  var listData = new Array();
  
  var dataRef = admin.firestore().collection('SAMPLE');

  await dataRef.where('APP_VER', '==', params.APP_VER).get()
    .then(snapshot => {
      snapshot.forEach(doc => {                
        listData.push(doc.data());
      });
    })
    .catch(err => {     
      console.log('Error getting documents', err);      
      res.json(setResult("read","E",'Error getting documents : '+err.stack,''));    
    });
  
  res.json(setResult("read","S","",listData));    
});

 // Update Sample Functions
exports.update = functions.https.onRequest(async (req, res) => {    
   var params = getParamsObj(req);
   console.log('----------[[update]]---------- : '+ JSON.stringify(params));  

  try{
    await admin.firestore().collection('SAMPLE').doc(params.APP_ID).update(    
         { 
           APP_KEY : params.APP_KEY
          ,APP_NUMBER : params.APP_NUMBER
          ,APP_VER : params.APP_VER
          ,Z_LAST_ACCESS_TIME : params.Z_LAST_ACCESS_TIME
         }
      );
    res.json(setResult("update","S",`DOC ID: ${params.APP_ID} updated.`,'')); 
  }catch(err){
    console.error(err);
    res.json(setResult("update","E",err.stack,``));      
  }       
});

 // Delete Sample Functions
exports.delete = functions.https.onRequest(async (req, res) => {    
  var params = getParamsObj(req);
  console.log('----------[[delete]]---------- : '+ JSON.stringify(params));  

  try{
    await admin.firestore().collection('SAMPLE').doc(params.APP_ID).delete();
    res.json(setResult("delete","S",`DOC ID: ${params.APP_ID} deleted.`,``)); 
  }catch(err){
    console.error(err);
    res.json(setResult("delete","E",err.stack,``));      
  }      
});

// [START addMessage]
// Take the text parameter passed to this HTTP endpoint and insert it into the
// Realtime Database under the path /messages/:documentId/original
// [START addMessageTrigger]
exports.addMessage = functions.https.onRequest(async (req, res) => {
// [END addMessageTrigger]
// Grab the text parameter.
const original = req.query.text;
// [START adminSdkAdd]
// Push the new message into the Realtime Database using the Firebase Admin SDK.
const writeResult = await admin.firestore().collection('messages').add({original: original});
// Send back a message that we've succesfully written the message
res.json({result: `Message with ID: ${writeResult.id} added.`});
// [END adminSdkAdd]
});
// [END addMessage]
  
// [START makeUppercase]
// Listens for new messages added to /messages/:documentId/original and creates an
// uppercase version of the message to /messages/:documentId/uppercase
// [START makeUppercaseTrigger]
exports.makeUppercase = functions.firestore.document('/messages/{documentId}')
  .onCreate((snap, context) => {
// [END makeUppercaseTrigger]
	// [START makeUppercaseBody]
	// Grab the current value of what was written to the Realtime Database.
	const original = snap.data().original;
	console.log('Uppercasing', context.params.documentId, original);
	const uppercase = original.toUpperCase();
	// You must return a Promise when performing asynchronous tasks inside a Functions such as
	// writing to the Firebase Realtime Database.
	// Setting an 'uppercase' sibling in the Realtime Database returns a Promise.
	return snap.ref.set({uppercase}, {merge: true});
	// [END makeUppercaseBody]
  });
// [END makeUppercase]
// [END all]
*/  

//////////////////////////////////////////////////////////////////////////////////////