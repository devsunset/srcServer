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
'use strict';

// [START all]
// [START import]
// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();
// [END import]

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
function setResult(result_code,result_message,result_data){
	var result = new Object();
  result.RESULT_CODE = result_code;
  result.RESULT_MESSAGE = result_message;
  result.DATA = result_data;	
	return JSON.parse(JSON.stringify(result));
}

//////////////////////////////////////////////////////////////////////////////////////

// App Info
exports.appInfoInit = functions.https.onRequest(async (req, res) => {    
    var params = getParamsObj(req);
    console.log('----------[[appInfoInit]]----------  1 : '+ JSON.stringify(params));      
    const writeResult = await admin.firestore().collection('users').add(getParamsJson(req));    
    console.log('----------[[appInfoInit]]----------  2 : ');      
    res.json(setResult("S","",`Message with ID: ${writeResult.id} added.`));    
  });

//////////////////////////////////////////////////////////////////////////////////////

/* 

### Cloud Filestore sample ###

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