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
  result.RESULT_DATA = result_data;	
	return JSON.parse(JSON.stringify(result));
}
//////////////////////////////////////////////////////////////////////////////////////

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

// Sample Process Functions

// Create Sample Functions
exports.create = functions.https.onRequest(async (req, res) => {    
  var params = getParamsObj(req);
  console.log('----------[[create]]---------- : '+ JSON.stringify(params));     
    
  params.X_BLACK_LIST = "-";
  params.X_BLACK_LIST_CHANGE_REASON = "-";
  params.X_BLACK_LIST_CHANGE_TIME = "-";
  params.Z_INIT_ACCESS_TIME = params.Z_LAST_ACCESS_TIME;

  try{
    await admin.firestore().collection('SAMPLE').doc(params.APP_ID).set(params);     
    res.json(setResult("create","S","",`DOC ID: ${params.APP_ID} created.`));   
  }catch(err){
    console.error(err);
    res.json(setResult("create","E",err.stack,`DOC ID: ${params.APP_ID}`));       
  }
 });

 // Read Sample Functions (To-Do)
exports.read = functions.https.onRequest(async (req, res) => {    
  var params = getParamsObj(req);
  console.log('----------[[read]]---------- : '+ JSON.stringify(params));    

  var listData = new Array();
  
  var dataRef = admin.firestore().collection('SAMPLE');

  await dataRef.where('AGE', '==', params.AGE).get()
    .then(snapshot => {
      snapshot.forEach(doc => {                
        listData.push(doc.data());
      });
    })
    .catch(err => {     
      console.log('Error getting documents', err);      
      res.json(setResult("read","E",'Error getting documents : '+err.stack,listData));    
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
          ,AGE : params.AGE
          ,AREA : params.AREA
          ,DOMESTIC_OVERSEAS : params.DOMESTIC_OVERSEAS
          ,GENDER : params.GENDER
          ,LANG : params.LANG
          ,SET_AGE_YN : params.SET_AGE_YN
          ,SET_AREA_YN : params.SET_AREA_YN
          ,SET_DOMESTIC_OVERSEAS_YN : params.SET_DOMESTIC_OVERSEAS_YN
          ,SET_GENDER_YN : params.SET_GENDER_YN
          ,SET_NEW_RECEIVE_YN : params.SET_NEW_RECEIVE_YN
          ,SET_SOUND_YN : params.SET_SOUND_YN
          ,SET_VIBRATION_YN : params.SET_VIBRATION_YN
          ,Z_LAST_ACCESS_TIME : params.Z_LAST_ACCESS_TIME
         }
      );
    res.json(setResult("update","S","",`DOC ID: ${params.APP_ID} updated.`)); 
  }catch(err){
    console.error(err);
    res.json(setResult("update","E",err.stack,`DOC ID: ${params.APP_ID}`));      
  }       
 });

 // Delete Sample Functions
exports.delete = functions.https.onRequest(async (req, res) => {    
  var params = getParamsObj(req);
  console.log('----------[[delete]]---------- : '+ JSON.stringify(params));  

  try{
    await admin.firestore().collection('SAMPLE').doc(params.APP_ID).delete();
    res.json(setResult("delete","S","",`DOC ID: ${params.APP_ID} deleted.`)); 
  }catch(err){
    console.error(err);
    res.json(setResult("delete","E",err.stack,`DOC ID: ${params.APP_ID}`));      
  }      
 });

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

//////////////////////////////////////////////////////////////////////////////////////

// Biz Logic Process Functions

// App Info Init
exports.appInfoInit = functions.https.onRequest(async (req, res) => { 
   if(LOG_FLAG){
      var params = getParamsObj(req);
      console.log('----------[[appInfoInit]]---------- : '+ JSON.stringify(params));      
   }  
    params.X_BLACK_LIST = "-";
    params.X_BLACK_LIST_CHANGE_REASON = "-";
    params.X_BLACK_LIST_CHANGE_TIME = "-";
    params.Z_INIT_ACCESS_TIME = params.Z_LAST_ACCESS_TIME;
 
    try{
      await admin.firestore().collection('APP_USERS').doc(params.APP_ID).set(params);     
      res.json(setResult("appInfoInit","S","",`DOC ID: ${params.APP_ID} created.`));   
    }catch(err){
      console.error(err);
      res.json(setResult("appInfoInit","E",err.stack,`DOC ID: ${params.APP_ID}`));       
    }
  });

  // App Info Update
exports.appInfoUpdate = functions.https.onRequest(async (req, res) => { 
  if(LOG_FLAG){
     var params = getParamsObj(req);
     console.log('----------[[appInfoUpdate]]---------- : '+ JSON.stringify(params));      
  }  
  
  try{
    await admin.firestore().collection('APP_USERS').doc(params.APP_ID).update(    
      { 
         APP_KEY : params.APP_KEY
        ,APP_NUMBER : params.APP_NUMBER
        ,APP_VER : params.APP_VER
        ,AGE : params.AGE
        ,AREA : params.AREA
        ,DOMESTIC_OVERSEAS : params.DOMESTIC_OVERSEAS
        ,GENDER : params.GENDER
        ,LANG : params.LANG
        ,SET_AGE_YN : params.SET_AGE_YN
        ,SET_AREA_YN : params.SET_AREA_YN
        ,SET_DOMESTIC_OVERSEAS_YN : params.SET_DOMESTIC_OVERSEAS_YN
        ,SET_GENDER_YN : params.SET_GENDER_YN
        ,SET_NEW_RECEIVE_YN : params.SET_NEW_RECEIVE_YN
        ,SET_SOUND_YN : params.SET_SOUND_YN
        ,SET_VIBRATION_YN : params.SET_VIBRATION_YN
        ,Z_LAST_ACCESS_TIME : params.Z_LAST_ACCESS_TIME
      }
    );
    res.json(setResult("appInfoUpdate","S","",`DOC ID: ${params.APP_ID} updated.`)); 
  }catch(err){
    console.error(err);
    res.json(setResult("appInfoUpdate","E",err.stack,`DOC ID: ${params.APP_ID}`));    
  }
 });

//////////////////////////////////////////////////////////////////////////////////////
