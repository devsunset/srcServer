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

//////////////////////////////////////////////////////////////////////////////////////
//////////////            Simple Random Chat Common Declare             //////////////
//////////////////////////////////////////////////////////////////////////////////////

// LOG PRINT FLAG
const LOG_FLAG = true;

// TARGET SEARCH LIMIT
const RANDOM_NUMBER_LIMIT = 1000;

// MESSSAGE STATUS
const MESSAGE_STATUS_FIRST = 'F';
const MESSAGE_STATUS_PROCEDDING = 'P';
const MESSAGE_STATUS_DELETE = 'D';
const MESSAGE_STATUS_X = 'X';

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
//////////////    Simple Random Chat Common Logic Process Functions     //////////////
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

///■■■  random integer value return  - min ~ max
function getRandomIdx(min, max) {
  if(min == 0 && max == 1){
    return 0;
  }  
  var randomIdx = Math.floor(Math.random() * (max - min)) + min;
  if(randomIdx == max){
     return max - 1 ;
  }
  return randomIdx;
}

//////////////////////////////////////////////////////////////////////////////////////
//////////////     Simple Random Chat Biz Logic Process Functions       //////////////
//////////////////////////////////////////////////////////////////////////////////////

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

  if("-" != params.APP_ID){
      try{
        await admin.firestore().collection('APP_USERS').doc(params.APP_ID).update(
          {
            Z_LAST_ACCESS_TIME : params.Z_LAST_ACCESS_TIME
          }
        );
      }catch(err){
        console.error(err);
      }
  }
  res.json(setResult("appNotice","S","",listData));
});

// App Info Init
exports.appInfoInit = functions.https.onRequest(async (req, res) => {
	if(LOG_FLAG){
	  var params = getParamsObj(req);
	  console.log('----------[[appInfoInit]]---------- : '+ JSON.stringify(params));
	}

	params.APP_STATUS = "A"; // Active User
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

  params.APP_STATUS = "A"; // Active User
  params.Z_LAST_ACCESS_TIME = params.Z_LAST_ACCESS_TIME;

  if("-" != params.APP_ID){
    try{
      await admin.firestore().collection('APP_USERS').doc(params.APP_ID).set(params);
      res.json(setResult("appInfoUpdate","S",`DOC ID: ${params.APP_ID} updated.`,''));
    }catch(err){
      console.error(err);
      res.json(setResult("appInfoUpdate","E",err.stack,``));
    }
  }else{
    res.json(setResult("appInfoUpdate","E","APP_ID - SKIP",``));
  }
});

// Send Message
exports.sendMessage = functions.https.onRequest(async (req, res) => {
   if(LOG_FLAG){
      var params = getParamsObj(req);
      console.log('----------[[sendMessage]]---------- : '+ JSON.stringify(params));
   }

    var listData = new Array();

    var dataRef = admin.firestore().collection('APP_USERS');

    // Gender ALL
    if(params.SET_SEND_GENDER == "A"){

      if(params.SET_SEND_COUNTRY == "L"){
        // Local
        await dataRef.where('APP_STATUS', '==', 'A')
                     .where('SET_NEW_RECEIVE_YN', '==', 'Y')
                     .where('COUNTRY', '==', params.COUNTRY)
                     .orderBy("Z_LAST_ACCESS_TIME", "desc").limit(RANDOM_NUMBER_LIMIT).get()
                     .then(snapshot => {
                      snapshot.forEach(doc => {
                        if (params.FROM_APP_ID != doc.data().APP_ID){
                            listData.push(doc.data());
                        }
                      });
                    })
                    .catch(err => {
                      console.log('Error getting documents', err);
                    });
      }else{
        // World
        await dataRef.where('APP_STATUS', '==', 'A')
                     .where('SET_NEW_RECEIVE_YN', '==', 'Y')
                     .orderBy("Z_LAST_ACCESS_TIME", "desc").limit(RANDOM_NUMBER_LIMIT).get()
                     .then(snapshot => {
                      snapshot.forEach(doc => {
                        // To-Do 조건처리 (world)
                        if (params.FROM_APP_ID != doc.data().APP_ID && params.FROM_COUNTRY != doc.data().COUNTRY ){
                            listData.push(doc.data());
                        }
                      });
                    })
                    .catch(err => {
                      console.log('Error getting documents', err);
                    });
      }

    // Gender Target
    }else{
      if(params.SET_SEND_COUNTRY == "L"){
        // Local
        await dataRef.where('APP_STATUS', '==', 'A')
                     .where('SET_NEW_RECEIVE_YN', '==', 'Y')
                     .where('COUNTRY', '==', params.COUNTRY)
                     .where('GENDER', '==', params.SET_SEND_GENDER)
                     .orderBy("Z_LAST_ACCESS_TIME", "desc").limit(RANDOM_NUMBER_LIMIT).get()
                     .then(snapshot => {
                      snapshot.forEach(doc => {
                        if (params.FROM_APP_ID != doc.data().APP_ID){
                            listData.push(doc.data());
                        }
                      });
                    })
                    .catch(err => {
                      console.log('Error getting documents', err);
                    });
      }else{
        // World
        await dataRef.where('APP_STATUS', '==', 'A')
                     .where('SET_NEW_RECEIVE_YN', '==', 'Y')
                     .where('GENDER', '==', params.SET_SEND_GENDER)
                     .orderBy("Z_LAST_ACCESS_TIME", "desc").limit(RANDOM_NUMBER_LIMIT).get()
                     .then(snapshot => {
                      snapshot.forEach(doc => {
                        // To-Do 조건처리 (world)
                        if (params.FROM_APP_ID != doc.data().APP_ID && params.FROM_COUNTRY != doc.data().COUNTRY ){
                            listData.push(doc.data());
                        }
                      });
                    })
                    .catch(err => {
                      console.log('Error getting documents', err);
                    });
        }
    }

     if(listData.length > 0 ){

         var idx  = getRandomIdx(0,listData.length);

         // App Talk Main History
         var appTalkMain =  {
          ATX_ID: params.ATX_ID,
          ATX_STATUS: MESSAGE_STATUS_FIRST,
          FROM_APP_ID: params.FROM_APP_ID,
          FROM_COUNTRY: params.FROM_COUNTRY,
          FROM_COUNTRY_NAME: params.FROM_COUNTRY_NAME,
          FROM_GENDER: params.FROM_GENDER,
          FROM_LANG: params.FROM_LANG,   
          TALK_APP_ID: params.TALK_APP_ID,
          TALK_TEXT: params.TALK_TEXT,
          TALK_TYPE: params.TALK_TYPE,
          TO_APP_ID: listData[idx].APP_ID,
          TO_COUNTRY: listData[idx].COUNTRY,
          TO_COUNTRY_NAME: listData[idx].COUNTRY_NAME,
          TO_GENDER: listData[idx].GENDER,
          TO_LANG: listData[idx].LANG,
          Z_INIT_ACCESS_TIME: params.Z_LAST_ACCESS_TIME
        }

        try{
          await admin.firestore().collection('APP_TALK_MAIN').doc(params.ATX_ID).set(appTalkMain);
        }catch(err){
          console.error(err);             
        }

        // App Talk Thread History
         var appTalkThread =  {
          ATX_ID: params.ATX_ID,
          TALK_APP_ID: params.FROM_APP_ID,  
          TALK_ID:params.TALK_ID,
          TALK_COUNTRY: params.FROM_COUNTRY,
          TALK_COUNTRY_NAME: params.FROM_COUNTRY_NAME,
          TALK_GENDER: params.FROM_GENDER,
          TALK_LANG: params.FROM_LANG,
          TALK_TEXT: params.TALK_TEXT,
          TALK_TYPE: params.TALK_TYPE,
          Z_INIT_ACCESS_TIME: params.Z_LAST_ACCESS_TIME
        }

        try{
          await admin.firestore().collection('APP_TALK_THREAD').doc(params.TALK_ID).set(appTalkThread);
        }catch(err){
          console.error(err);             
        }
        //Build the message payload and send the message
          var payload = {
            data: {
              ATX_ID: params.ATX_ID,
              ATX_STATUS: MESSAGE_STATUS_FIRST,
              FROM_APP_ID: params.FROM_APP_ID,
              FROM_APP_KEY:  params.FROM_APP_KEY,
              FROM_COUNTRY:  params.FROM_COUNTRY,
              FROM_COUNTRY_NAME:  params.FROM_COUNTRY_NAME,
              FROM_GENDER:  params.FROM_GENDER,
              FROM_LANG:  params.FROM_LANG,
              TALK_ID:params.TALK_ID,
              TALK_APP_ID: params.APP_ID,
              TALK_TEXT: params.TALK_TEXT,
              TALK_TYPE: params.TALK_TYPE,
              TO_APP_ID: listData[idx].APP_ID,
              TO_APP_KEY: listData[idx].APP_KEY,
              TO_COUNTRY: listData[idx].COUNTRY,
              TO_COUNTRY_NAME: listData[idx].COUNTRY_NAME,
              TO_GENDER: listData[idx].GENDER,
              TO_LANG: listData[idx].LANG
            }
          };
          // Create an options object that contains the time to live for the notification and the priority
          const options = {
              priority: "high",
              timeToLive: 60 * 60 * 24 * 15
          };
          // FROM
          await admin.messaging().sendToDevice(params.FROM_APP_KEY, payload,options)
            .then(function(response) {
                  console.log("Successfully send message:", response);
              })
              .catch(function(error) {
                  console.log("Error send message:", error);
              });
          // TO
          await admin.messaging().sendToDevice(listData[idx].APP_KEY, payload,options)
          .then(function(response) {
                console.log("Successfully send message:", response);
                //To-Do 메세지 전송 실패시 후 처리 
                res.json(setResult("sendMessage","S",'',''));
            })
            .catch(function(error) {
              console.log("Error send message:", error);
              res.json(setResult("sendMessage","E",error,''));
            });
     }else{
        // App Talk Main History
        var appTalkMain =  {
              ATX_ID: params.ATX_ID,
              ATX_STATUS: MESSAGE_STATUS_X,
              FROM_APP_ID: params.FROM_APP_ID,
              FROM_COUNTRY: params.FROM_COUNTRY,
              FROM_COUNTRY_NAME: params.FROM_COUNTRY_NAME,
              FROM_GENDER: params.FROM_GENDER,
              FROM_LANG: params.FROM_LANG,
              TALK_APP_ID: params.APP_ID,
              TALK_TEXT: params.TALK_TEXT,
              TALK_TYPE: params.TALK_TYPE,
              Z_INIT_ACCESS_TIME: params.Z_LAST_ACCESS_TIME
            }

            try{
              await admin.firestore().collection('APP_TALK_MAIN').doc(params.ATX_ID).set(appTalkMain);
            }catch(err){
              console.error(err);             
            }

        res.json(setResult("sendMessage","E","TARGET_NO_DATA",''));
     }
});

// Reply Message
exports.replyMessage = functions.https.onRequest(async (req, res) => {
   if(LOG_FLAG){
      var params = getParamsObj(req);
      console.log('----------[[replyMessage]]---------- : '+ JSON.stringify(params));
   }
    // App Talk Main History Update
    try{
      await admin.firestore().collection('APP_TALK_MAIN').doc(params.ATX_ID).update(
        {
          ATX_STATUS: MESSAGE_STATUS_PROCEDDING,
          TALK_APP_ID: params.TALK_APP_ID,
          TALK_TEXT: params.TALK_TEXT,
          TALK_TYPE: params.TALK_TYPE,
          Z_LAST_ACCESS_TIME : params.Z_LAST_ACCESS_TIME        
        }
      );
    }catch(err){
      console.error(err);
    }

    // App Talk Thread History
    var appTalkThread =  {
      ATX_ID: params.ATX_ID,
      TALK_APP_ID: params.TALK_APP_ID,  
      TALK_ID:params.TALK_ID,
      TALK_COUNTRY: params.TALK_COUNTRY,
      TALK_COUNTRY_NAME: params.TALK_COUNTRY_NAME,
      TALK_GENDER: params.TALK_GENDER,
      TALK_LANG: params.TALK_LANG,
      TALK_TEXT: params.TALK_TEXT,
      TALK_TEXT_IMAGE: params.TALK_TEXT_IMAGE,
      TALK_TEXT_VOICE: params.TALK_TEXT_VOICE,
      TALK_TYPE: params.TALK_TYPE,
      Z_INIT_ACCESS_TIME:params.Z_LAST_ACCESS_TIME
    }

    try{
      await admin.firestore().collection('APP_TALK_THREAD').doc(params.TALK_ID).set(appTalkThread);
    }catch(err){
      console.error(err);             
    }

    //Build the message payload and send the message
    var payload = {
      data: {        
        ATX_ID: params.ATX_ID,
        ATX_STATUS:MESSAGE_STATUS_PROCEDDING,
        TALK_APP_ID: params.TALK_APP_ID,  
        TALK_ID:params.TALK_ID,
        TALK_COUNTRY: params.TALK_COUNTRY,
        TALK_COUNTRY_NAME: params.TALK_COUNTRY_NAME,
        TALK_GENDER: params.TALK_GENDER,
        TALK_LANG: params.TALK_LANG,
        TALK_TEXT: params.TALK_TEXT,
        TALK_TEXT_IMAGE: params.TALK_TEXT_IMAGE,
        TALK_TEXT_VOICE: params.TALK_TEXT_VOICE,
        TALK_TYPE: params.TALK_TYPE
      }
    };

    // Create an options object that contains the time to live for the notification and the priority
    const options = {
        priority: "high",
        timeToLive: 60 * 60 * 24 * 15
    };

    await admin.messaging().sendToDevice(params.TO_APP_KEY, payload,options)
      .then(function(response) {
            console.log("Successfully reply message:", response);
            //To-Do 메세지 전송 실패시 후 처리 
            res.json(setResult("replyMessage","S",``,''));
        })
        .catch(function(error) {
            console.log("Error reply message:", error);
            res.json(setResult("replyMessage","E",error,''));
        }); 
});

// Bye Message
exports.byeMessage = functions.https.onRequest(async (req, res) => {
   if(LOG_FLAG){
      var params = getParamsObj(req);
      console.log('----------[[byeMessage]]---------- : '+ JSON.stringify(params));
   }
   // App Talk Main History Update
   try{
      await admin.firestore().collection('APP_TALK_MAIN').doc(params.ATX_ID).update(
        {
          ATX_STATUS: MESSAGE_STATUS_DELETE,
          TALK_APP_ID: params.TALK_APP_ID,
          Z_LAST_ACCESS_TIME : params.Z_LAST_ACCESS_TIME        
        }
      );
    }catch(err){
      console.error(err);
    }
  //Build the message payload and send the message
  var payload = {
    data: {        
      ATX_ID: params.ATX_ID,
      ATX_STATUS:MESSAGE_STATUS_DELETE
    }
  };
  // Create an options object that contains the time to live for the notification and the priority
  const options = {
      priority: "high",
      timeToLive: 60 * 60 * 24 * 15
  };

  await admin.messaging().sendToDevice(params.TO_APP_KEY, payload,options)
    .then(function(response) {
          console.log("Successfully bye message:", response);
          //To-Do 메세지 전송 실패시 후 처리 
          res.json(setResult("byeMessage","S",``,''));
      })
      .catch(function(error) {
          console.log("Error bye message:", error);
          res.json(setResult("byeMessage","E",error,''));
      }); 
});

// Get Talk Thread Data
exports.getTalkThreadData = functions.https.onRequest(async (req, res) => {
   if(LOG_FLAG){
      var params = getParamsObj(req);
      console.log('----------[[getTalkThreadData]]---------- : '+ JSON.stringify(params));
   }

  var listData = new Array();

  var dataRef = admin.firestore().collection('APP_TALK_THREAD');

  await dataRef.where('TALK_ID', '==', params.TALK_ID).get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        listData.push(doc.data());
      });
    })
    .catch(err => {
      console.log('Error getting documents', err);
      res.json(setResult("getTalkThreadData","E",'Error getting documents : '+err.stack,''));
    });

   res.json(setResult("getTalkThreadData","S",``,listData));
});

// Request Black List
exports.requstBlackList = functions.https.onRequest(async (req, res) => {
   if(LOG_FLAG){
      var params = getParamsObj(req);
      console.log('----------[[requstBlackList]]---------- : '+ JSON.stringify(params));
   }
   
   try{
        var blackList = new Object();
        blackList.ATX_ID = params.ATX_ID;
        blackList.REQUEST_APP_ID = params.TALK_APP_ID;
        blackList.BLACK_LIST_APP_ID = params.BLACK_LIST_APP_ID;
        blackList.Z_INIT_ACCESS_TIME = params.Z_LAST_ACCESS_TIME; 

        await admin.firestore().collection('APP_BLACK_LIST').doc(params.BLA_ID).set(blackList);
   }catch(err){
     console.error(err);
   }
    // App Talk Main History Update
    try{
      await admin.firestore().collection('APP_TALK_MAIN').doc(params.ATX_ID).update(
        {
          ATX_STATUS: MESSAGE_STATUS_DELETE,
          TALK_APP_ID: params.TALK_APP_ID,
          Z_LAST_ACCESS_TIME : params.Z_LAST_ACCESS_TIME        
        }
      );
    }catch(err){
      console.error(err);
    }
    //Build the message payload and send the message
    var payload = {
      data: {        
        ATX_ID: params.ATX_ID,
        ATX_STATUS:MESSAGE_STATUS_DELETE
      }
    };
    // Create an options object that contains the time to live for the notification and the priority
    const options = {
        priority: "high",
        timeToLive: 60 * 60 * 24 * 15
    };
  
    await admin.messaging().sendToDevice(params.TO_APP_KEY, payload,options)
    .then(function(response) {
          console.log("Successfully bye message:", response);
          //To-Do 메세지 전송 실패시 후 처리 
          res.json(setResult("requstBlackList","S",``,''));
      })
      .catch(function(error) {
          console.log("Error bye message:", error);
          res.json(setResult("requstBlackList","E",error,''));
      }); 
});

// Error Stack Trace
exports.errorStackTrace = functions.https.onRequest(async (req, res) => {
   if(LOG_FLAG){
      var params = getParamsObj(req);
      console.log('----------[[errorStackTrace]]---------- : '+ JSON.stringify(params));
   }   
   try{
     params.Z_INIT_ACCESS_TIME = params.Z_LAST_ACCESS_TIME;
     await admin.firestore().collection('APP_ERROR').doc(params.ERR_ID).set(params);
     res.json(setResult("errorStackTrace","S",`DOC ID: ${params.ERR_ID} created.`,''));
   }catch(err){
     console.error(err);
     res.json(setResult("errorStackTrace","E",err.stack,``));
   }
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
