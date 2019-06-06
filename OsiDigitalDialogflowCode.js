'use strict';
var firebase = require('firebase');
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Suggestion,Text,Card,Button,Carousel,BasicCard, Image} = require('dialogflow-fulfillment');
//const {Suggestion,Text,Card,Button,Carousel,BasicCard, Image,SignIn} = require('actions-on-google');
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

const db = admin.firestore();

db.settings({timestampInSnapshots : true});

const nodemailer = require("nodemailer");

//const navigate = require('navigate');

const Window = require('window');

const window = new Window();

var email;

const image = 'http://ceoclubsindia.org/sites/default/files/styles/profile_pics/public/pictures/picture-23-1416394312.jpg?itok=3rnREC2f';

exports.dialogflowFirebaseFulfillment =functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  //agent.requestSource = agent.ACTIONS_ON_GOOGLE;
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
  
 
  
  function welcome(agent)
  {
    agent.add('Hi,May I know you Name');
  }
  
  function Name(agent)
  {
    const name = agent.parameters.any;      
    agent.add(`Greetings ${name}`);
    agent.add('How may I help you');
  }
 
  function contacts(agent)
  {    
    const tech = agent.parameters.Technology;
    const industry = agent.parameters.Industry;
    console.log('technology is  ',tech,'  industry is ',industry);
    var details;
    var info = '';
    if(tech){
      console.log('inside tech if');
      console.log(tech);
      details = db.collection('contacts').where('Technology','==',tech);
    }else if(industry){
      console.log('inside industry if');
      console.log(industry);
      details = db.collection('contacts').where('Industry','==',industry);
    }
    console.log(details);
      return details.get()
      .then(doc => {
        if(!doc.empty){
            doc.forEach(docs =>{
              agent.add(`For any information about ${tech} Projects , please contact ${docs.data().Name},${docs.data().number},email ID : ${docs.data().email}` );
              info = info + `${docs.data().Name}, Phone Number : ${docs.data().number} , Email id : ${docs.data().email} <br>`;
            });
        agent.add('would you like me to send you an email');
        console.log('info is ',info);
        agent.setContext
        ({
          name: 'phonedetails',
          lifespan: 1,
          parameters:
          {
            contact : info
          }
        });
        }else{
          agent.add('Sorry! There are no Contact details availabel for this Technology or Industry');
        }
      }).catch(() =>{
        agent.add('Error reading contacts data  from the database.');
      });
  }
  
  function contactsYes(agent){
    console.log('email is',email);
    if(email === '' || email === undefined)
    {
      agent.add('email is required');
    }
    else
    {     
      contact_custom(agent);   
    }
  }
  
  function contact_custom(agent){
    console.log('inside contact_custom');
    const contacts = agent.getContext('phonedetails');
    const contact = contacts.parameters.contact;
    var mail;
    console.log('contact details are  ' ,contact);
    if(email === '' || email === undefined){
      email = agent.parameters.email;
      console.log('just taken email id :::: ',email);
      mail = email;
    }else{
      mail = email;
    }
    sendingMail(contact,mail);
    agent.add(`mail sent successfully to ${mail}`);  
  }

  function aboutOSI(agent)
  {
    agent.add('O S I Dgital provides expert technology solutions that optimize performance and enable data-driven outcomes for our customers');    
    
    window.location.replace("http://www.w3schools.com");
  }
   
  function caseStudies(agent)
  {
    const tech = agent.parameters.Technology;
    console.log(`tech : ${tech}`);
    const industry = agent.parameters.Industry;
    console.log(`industry : ${industry}`);
    if(tech !== '' && industry !== '')
    {
      agent.add(`You have requested for Case Studies on ${tech} in ${industry} industry, can you confirm for it`);
    }else if(tech === '' && industry !== ''){
      agent.add(`would you like me to send case studies in ${industry} industry on all technologies`);
    }else{
      agent.add(`Would you like me to send mail of Case Studies of ${tech} in all industries`);
    }     
  }
  
  function caseStudiesYes(agent)
  {  
    console.log('email id in caseStudiesYes intent : ',email);
    if(email === '' || email === undefined)
    {
      agent.add('your email id is required');
    }
    else
    {
      var test = caseStudiesYes_custom(agent);
      return test.then(doc =>{
        }).catch(err => {
      });
    }
  }
  
  function caseStudiesYes_custom(agent){
    const caseStudy = agent.getContext('casestudies-followup');
    const tech = caseStudy.parameters.Technology;
    const industry = caseStudy.parameters.Industry;
    console.log(`values are ${tech},${industry}`); 
    var file;
    var html = '';
    var mail;
    if(industry === '' && tech !== '')
    {      
      console.log(`technology is ${tech}`);
      file = db.collection('case studies').where("technology", "==",`${tech}`);
    }else if(tech === '' && industry !== ''){
      console.log(`industry is ${industry}`);
      file = db.collection('case studies').where("industry", "==",`${industry}`);
    }
    else 
    {
      agent.add('case study yes else block');
    }
    if(email === '' || email === undefined){
      email = agent.parameters.email;
      mail = email;
    }else{
      mail = email;
    }
    return file.get().then(querySnapshot =>{
      if(!querySnapshot.empty){
           console.log(querySnapshot);
           querySnapshot.forEach(docs =>{             
             console.log(`id is ${docs.id}`);            
             console.log(`link is ${docs.data().file}`);
             html = html +'Name : "'+docs.id+'"<br>Industry : "'+docs.data().industry+'" <br>Technology :"'+docs.data().technology+'" <br>Link :<a href= "'+docs.data().file+'" >"'+docs.data().file+'"</a><br><br>';
           });
      sendingMail(html,mail);
      agent.add(`mail sent successfully to ${mail}`);
      console.log(`mail sent successfully to ${mail} this line is from caseStudiesYes_custom intent `);
      }else{
        agent.add('Sorry! There are no Case Studies Available on this Technology or Industry');
      }
    }).catch(err =>{
      agent.add('There are no details available for the information you asked. ');
      console.log(err);
    });    
  }
  
  function caseStudiesNo(agent)
  {
    const casestudy = agent.getContext('casestudies-followup');
    const tech = casestudy.parameters.Technology;
    const industry = casestudy.parameters.Industry;
    console.log('inside caseStudiesNo intent',tech ,'and',industry);
    if(industry === ''){   
      agent.add('please enter an industry');
      console.log('please enter an industry');
    }else if(tech === ''){
      agent.add('please enter an technology');
      console.log('please enter an technology');
    }else{
      agent.add("any other requests");
    }    
  }
  
  function dbLogic(mail,tech,industry){
    var html = '';
    console.log(`technology values is ${tech} and industry values is ${industry}`);
    var file = db.collection('case studies').where("technology", "==",`${tech}`).where("industry", "==",`${industry}`);
    console.log('file value is :::: ',file);
    return file.get().then(doc =>{
      console.log(doc);
      if(!doc.empty){
        doc.forEach(docs =>{             
          console.log(`id is ${docs.id}`);            
          console.log(`link is ${docs.data().file}`);
          html = html +'Name : "'+docs.id+'"<br>Industry : "'+docs.data().industry+'" <br>Technology :"'+docs.data().technology+'" <br>Link :<a href= "'+docs.data().file+'" >"'+docs.data().file+'"</a><br><br>';
        });
        sendingMail(html,email);
        agent.add(`mail sent successfully to ${email}`);
      }else{
        agent.add('Sorry! There are no Case Studies Available on this Technology or Industry');
        console.log('Sorry! There are no Case Studies Available on this Technology or Industry');
      }
    }).catch(err =>{
      agent.add('There are no details available for the information you asked. ');
     console.log(err);
    });
 }
  
  function caseStudiesNo_custom()
  {
    const values = agent.getContext('casestudies-followup');
    var tech = values.parameters.Technology;
    var industry = values.parameters.Industry;
    console.log('inside caseStudiesNo_custom values are',tech , industry);
    if(tech === '' || tech === undefined){
      tech = agent.parameters.TechnologyTwo;
      console.log('taken technology value is :::: ',tech);
    }
    else if(industry === '' || industry === undefined) {
      industry = agent.parameters.IndustryTwo;
      console.log('taken Industry value is :::: ',industry);      
    }
    else{console.log('inside else');}
    agent.setContext({
      name : "casestudies-no-custom-followup",
      lifespan : 1,
      parameters : {
        TechnologyThree : tech,
        IndustryThree : industry
      }
    });
    console.log('casestudies-no-custom-followup is set',tech,industry);
    if(email === '' || email === undefined)
    {
      agent.add('Please Provide your email id');
      console.log('requesting for email id inside caseStudiesNo_custom ');
    }
    else{
      console.log('inside else block of caseStudiesNo_custom');
      var test = dbLogic(email,tech,industry);    
      return test.then(doc =>{
      }).catch(err => {
      });
    }
  }
  
  function caseStudiesNo_custom_custom(agent)
  {
    const caseStudy = agent.getContext('casestudies-no-custom-followup');
    const tech = caseStudy.parameters.TechnologyThree;
    const industry = caseStudy.parameters.IndustryThree;
    console.log(`values are ${tech},${industry}`); 
    console.log(`technology values is ${tech} and industry values is ${industry}`);
    var file = db.collection('case studies').where("technology", "==",`${tech}`).where("industry", "==",`${industry}`);
    email = agent.parameters.email;
    
    var test = dbLogic(email,tech,industry);
    return test.then(docs =>{
    }).catch(err => {});
    
  }
 
  function caseStudies_custom(agent)
  {
    const caseStudy = agent.getContext('casestudies-followup');
    console.log(caseStudy);
    var tech = caseStudy.parameters.Technology;
    var industry = caseStudy.parameters.Industry;
    console.log('values inside caseStudies_custom are',tech,'and',industry);
    if(tech === '')
    {
      tech = agent.parameters.Technologies;
      console.log('inside caseStudies_custom taking tech value',tech);
    }else if (industry === '')
    {
      industry = agent.parameters.Industries;
      console.log('inside caseStudies_custom taking industry value',industry);
    }else{
    }
    console.log('the final Values are ',tech,industry);
    agent.setContext({
      name: 'casestudies-custom-followup',
      lifespan: 1,
      parameters:
      {
        technologyOne : tech,
        industriesOne : industry
      }
    });
    console.log('the final Values are ',tech,industry);
    if(email === '' || email === undefined){
      agent.add('Please provide your email id');
    }else{
      console.log('inside caseStudies_custom email already exits therfore calling aseStudies_custom_custom function');
      var test = dbLogic(email,tech,industry);
      return test.then(docs =>{
      }).catch(err => {});
    }
  }

  function caseStudies_custom_custom(agent)
  {
    const caseStudy = agent.getContext('casestudies-custom-followup');
    var tech = caseStudy.parameters.technologyOne;
    var industry = caseStudy.parameters.industriesOne;
    var html = '';
    console.log(`technology values is ${tech} and industry values is ${industry}`);
    email = agent.parameters.email;
    console.log('just taken mail id :',email);
    var test = dbLogic(email,tech,industry);
    return test.then(docs =>{
    }).catch(err => {});    
  }
  
  function sendingMail(text,mail)
  {
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      ignoreTLS : true,
      requireTLS: true,
      UseSTARTTLS : true,
      auth: {
        user: 'testusers342@gmail.com',
        pass: 'test@342'
      },
      //logger : true,
      //debug : true,
    });
   
    let mailOptions = {
      from: 'testusers342@gmail.com', // sender address
      to: mail, // list of receivers
      subject: "OSI DIGITAL", // Subject line
      //text: file, // plain text body
      html: text
    };
    let info = transporter.sendMail(mailOptions);
    console.log(info);

    return info.then(res => {
      console.log(`mail sent successfully to ${mail}`);
    }).catch(err => {
      console.log("catch block");
      console.log(err);
      agent.add(`couldn't send the mail`);
    });  
  }
  
  function documentRequest(agent)
  {
    const type = agent.parameters.DocumentRequest;
    const project = agent.parameters.projectName;
    console.log('values are ::::: ',type,project);
    console.log('inside documentRequest email id is --->',email);
    if(email === '' || email === undefined){
      agent.add('email not specified');
    }else{
      console.log('inside documentRequest intent else block ');                //documentRequestDBLogic(type,project);   //documentRequest_custom(agent,file);
      var test = documentRequest_custom(agent);
      return test.then(doc => {
      }).catch(err => {});
    }
  }
  
  function documentRequest_custom(agent)
  {
    const doc = agent.getContext('documentrequest-followup');
    const type = doc.parameters.DocumentRequest;
    const project = doc.parameters.projectName;
    var files;
    var file= '';
    console.log('file valuetaken from context are ',type,project);
    email = agent.parameters.email;
    console.log('just taken mail id :::::',email);
 
    const docReq = db.collection('Projects');
    files = docReq.where("ProjectName","==",project).get();
    console.log('files values is ',files);
    
    return files.then(querySnapshot => {
      console.log(querySnapshot);
      if(!querySnapshot.empty){
        querySnapshot.forEach(doc =>{
          console.log(doc.id);
          if(type === 'PO'){
            console.log('inside PO if block');
            file =file+ `Project : ${doc.data().ProjectName}<br><a href= ${doc.data().link.PO}>Your ${type} file</a><br><br>`;
            console.log(file);
          }else if(type === 'SOW'){
            console.log('inside SOW if block');
            file =file+ `Project : ${doc.data().ProjectName}<br><a href= ${doc.data().link.SOW}>Your ${type} file</a><br><br>`;
            console.log(file);
          }else{
            agent.add('Requested file not Present');
            console.add('Requested file not Present');
          }          
      });
    
      sendingMail(file,email);
      agent.add(`Mail sent successfuly to ${email}`); 
      }else{
        agent.add('Sorry! Your Requested file not Present');
      }
      
    }).catch(err =>{
      console.log(err);
      agent.add('There are no details available for the information you asked. ');
    });
  }
   
  function ceo(agent)
  {
    agent.add('Anil Yamani is the MD of OSI Consulting');
    agent.add(new Card({    
      title: `Managing Director`,
      imageUrl: image,
      text: `Anil Yamani`,      
    }));    
  } 
  
  function employeeCount(agent)
  {
      agent.add('OSI DIGITAL has expanded to a global team of over 1,400 employees.');
  }
  
  function Formation(agent)
  {
      agent.add('O S I was founded in 1993 in California, and has since expanded to a global team of over 1,400 employees.');
  }
  
  function location(agent)
  {
  const country = agent.parameters.geocountry;
    const city = agent.parameters.geocity;
    var locs ;
    if((country === '' && city === '') || (country !== "" && city === "")|| (country !== "" && city !== "")|| (country === "" && city !== ""))
    {
      if(country === '' && city === ''){
        locs = db.collection('Locations');
      }else if(country !== '' && city === ''){
        locs = db.collection('Locations').where('Country','==',country);
      }else if(country === '' && city !== ''){
        locs = db.collection('Locations').where('City','==',city);
      }else{
        locs = db.collection('Locations').where('Country','==',country).where('City','==',city);
      }
    }else{
      agent.add('inside location else block');
    }
    console.log('promise ::::',locs);
    var countries=[];
    return locs.get().then(docs =>{
      docs.forEach(querySnapshot=>{
        if(country === '' && city === ''){
          if(countries.includes(`${querySnapshot.data().Country}`)){
          }else{
            countries.push(querySnapshot.data().Country);
            agent.add(querySnapshot.data().Country);
          }
        }else if(country !== '' && city === ''){
        agent.add(querySnapshot.data().City);
      }else if((city !== '' && country === '') ){
        agent.add(querySnapshot.data().address);
      }else{
        agent.add(querySnapshot.data().address);
      }
      });
    }).catch(err =>{
      agent.add('OSI Digital is not Present in your Requested Region');
    });
  }
   
  function askServices(agent)
  {
    agent.add('Which service would you like to know');
    agent.add(new Suggestion('Internet_Of_Things'));
    agent.add(new Suggestion('Managed_Services'));
    agent.add(new Suggestion('Package_Application'));
    agent.add(new Suggestion('Infrastructure_Services'));
    agent.add(new Suggestion('System_Integration'));
    agent.add(new Suggestion('Business_Intelligence'));
    agent.add(new Suggestion('Custom Application'));
  }
 
  function services(agent)
  {
    const service = agent.parameters.services;
    console.log(service);
    
    if(service !== '')
    {
      const Services = db.collection('Services').doc(service);
      return Services.get()
      .then(doc => {
            if(!doc.exists) 
            {
              agent.add(`OSI doesn't provide this service!`);
            }
            else
            {
              agent.add(doc.data().description);
            }
            }).catch(() => 
                {
                agent.add('Error reading data  from the database.');
                });
    }
    
  }
  
  function partnership(agent){
      agent.add('O S I partnered with Oracle, Salesforce, Tableau, GE Digital, Microsoft, Amazon Web Services, Red Hat and Zoho');
  }
  
  function endConversation(agent){
    agent.end('it was nice talking with you, Bye!');
  }
  
  function getOSIInsights(agent){
    
    var dateLength;
    var eventStartDate;
    var eventEndDate;
    var currentDate;
    var promise;
    
    const intentName = request.body.queryResult.intent.displayName;
    console.log('Intent name is : '+intentName);
    
    if (intentName =='OSI_Insights_Future' || intentName == 'OSI_Insights_Past') {
      var dateobj = new Date();
      
      // converted into a string using toISOString() function.
      var currentISODate = dateobj.toISOString();
      currentDate = currentISODate.toString().substring(0,10);
      console.log('currentDate is : '+ currentISODate);
      console.log('currentDate substring is : '+ currentDate);
    
    } else if (intentName =='getOSIInsights'){ //OSI_Insights_Period
      var datePeriod = agent.parameters.datePeriod;
      dateLength = Object.keys(datePeriod).length;
      if(dateLength!== 0){
        eventStartDate = datePeriod.startDate.toString().substring(0,10);
        eventEndDate = datePeriod.endDate.toString().substring(0,10);
        console.log('dateLength name : '+ dateLength);
        console.log('Event details Start date : '+ datePeriod.startDate);
        console.log('Event Start date to string : '+eventStartDate);
        console.log('Event End date to string : '+eventEndDate); 
      }
    }
    const internalInfo =agent.parameters.internalinfo.toLowerCase();
    var city = agent.parameters.geocity;
    var country = agent.parameters.country;
    
    console.log('City name : '+city);
    console.log('Country name : '+country);
    console.log('Internalinfo name : '+internalInfo);
    //OSI_Insights/Events(Doc)/Event(Col)/EventOne(Doc)
    
    const collecRef =db.collection('OSIInsights') ;
    console.log(collecRef);
    //Collection Reference
    if(city) {
      console.log('Event details for city');
      switch(intentName){
        case 'OSI_Insights_Future':
          promise = collecRef.where('Type','==', internalInfo).where('Place','==', city).where('Date','>=', currentDate).get();
          break;
        
        case 'OSI_Insights_Past':
          promise = collecRef.where('Type','==', internalInfo).where('Place','==', city).where('Date','<=', currentDate).get();
          break;
        
        case 'getOSIInsights':
          if(dateLength !== 0){
            promise = collecRef.where('Type','==', internalInfo).where('Place','==', city).where('Date','>=', eventStartDate)
              .where('Date','<=', eventEndDate).get();
          }else{
            promise = collecRef.where('Type','==', internalInfo).where('Place','==', city).get();
          }
          break;
      }
    }else if(country){
      console.log('Event details for country');
      switch(intentName){
        case 'OSI_Insights_Future':
          promise = collecRef.where('Type','==', internalInfo).where('Country','==', country.toLowerCase()).where('Date','>=', currentDate).get();
          break;
        
        case 'OSI_Insights_Past':
          promise = collecRef.where('Type','==', internalInfo).where('Country','==', country.toLowerCase()).where('Date','<=', currentDate).get();
          break;
        
        case 'getOSIInsights':
          if(dateLength !== 0){ 
            promise = collecRef.where('Type','==', internalInfo).where('Country','==', country.toLowerCase()).where('Date','>=', eventStartDate)
              .where('Date','<=', eventEndDate).get();
          }else{
            promise = collecRef.where('Type','==', internalInfo).where('Country','==', country.toLowerCase()).get();
          }
      }
    } else if(internalInfo !==null){
      console.log('Event details for date period');
      switch(intentName){
        case 'OSI_Insights_Future':
          promise = collecRef.orderBy('Date').where('Type','==', internalInfo).where('Date','>=', currentDate).get();
          break;
        
        case 'OSI_Insights_Past':
          promise = collecRef.orderBy('Date').where('Type','==', internalInfo).where('Date','<=', currentDate).get();
          break;
        
        case 'getOSIInsights':
          if(dateLength !== 0){ 
            promise = collecRef.orderBy('Date').where('Type','==', internalInfo).where('Date','>=', eventStartDate).where('Date','<=', eventEndDate).get();
          }
      }
      console.log('promise length at : '+promise);
    }
    return promise.then(snapshot => {
      var results = ''; 
      console.log('promise length is : '+promise.length +'or ' +snapshot.length);
      var count = 1;
      snapshot.forEach(doc=> {
        agent.add(internalInfo.toUpperCase() +' name : '+doc.data().Name);
        console.log(doc.id,'=>', doc.data());
        console.log(internalInfo +' Event details inside are : ',doc.data().Place);
        const data =JSON.stringify(doc.data());
        console.log('data : '+data);
        console.log(' Date : '+ doc.data().Date + ' Place : '+ doc.data().Place+' Presented by : '+doc.data().PersonName);
        agent.add(' Date : '+ doc.data().Date );
        agent.add(' Place : '+ doc.data().Place );
        agent.add(' Presented by : '+doc.data().PersonName); 
        count+=1;
      });
      agent.add(results);
    }).catch(err=> {
      console.log('Error getting document',err);
    });
  }
  
  let intentMap = new Map(); // Map functions to Dialogflow intent names
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Name', Name);
  intentMap.set('contactsYes - custom',contact_custom);
  intentMap.set('contacts', contacts);
  intentMap.set('contactsYes', contactsYes);
  intentMap.set('aboutOSI', aboutOSI);
  intentMap.set('caseStudies', caseStudies);
  intentMap.set('caseStudies-yes', caseStudiesYes);
  intentMap.set('caseStudies-yes - custom', caseStudiesYes_custom);
  intentMap.set('caseStudies-no', caseStudiesNo);
  intentMap.set('caseStudies-no - custom', caseStudiesNo_custom); 
  intentMap.set('caseStudies-no - custom - custom', caseStudiesNo_custom_custom);
  intentMap.set('caseStudies - custom', caseStudies_custom);
  intentMap.set('caseStudies - custom - custom', caseStudies_custom_custom);
  intentMap.set('ceo', ceo);
  intentMap.set('documentRequest', documentRequest);
  intentMap.set('documentRequest - custom', documentRequest_custom);
  intentMap.set('employeeCount', employeeCount);
  intentMap.set('Formation', Formation);
  intentMap.set('location', location);
  intentMap.set('partnership', partnership);
  intentMap.set('services', services);
  intentMap.set('askServices',askServices);
  intentMap.set('endConversation', endConversation);
  intentMap.set('getOSIInsights',getOSIInsights);
  intentMap.set('OSI_Insights_Future',getOSIInsights);
  intentMap.set('OSI_Insights_Past',getOSIInsights);
  agent.handleRequest(intentMap);
});
