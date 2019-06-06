
const express = require('express')
const dialogflow = require('dialogflow');
const uuid = require('uuid');
const cors = require('cors');
var http = require('http');


const app = express()
app.use(cors())
const port = 7000

app.get('/', function(req, res){

  // console.log('given query is ',req);


    const projectId = 'osidigital-12a7f';
    //const sessionId = uuid.v4();

//https://dialogflow.com/docs/agents#settings
// generate session id (currently hard coded)
    const sessionId = '981dbc33-7c54-5419-2cce-edf90efd2170';
    const query = req.query.msg;
    const languageCode = 'en-US';

    // Instantiate a DialogFlow client.

    let privateKey = '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDDGxkMM0ESnzAd\nlClQFnMpW7+nxnDq72MF/Z26EHNkTW4VN1rsTtharV8vFMABWaq0igp0vk28uLtl\nSEUCGDkMBfmi0XU6NEyQBBSxJsCdH2kQoaSQHOUuCxeTlNHI5MOhvSS94Nwu530Z\nttIjrpUxYqwk4Z745Dv0sT7P5m/e3q0k012ZudoY0AGcDqwyOxSVZxRAydRiDqwO\nLXpFDM1JI4I29TTKyCJTWoKmvJP3BX0nlpYd0IiPUIX2ds+zCnZAePK2bMMf2NLR\n+OC7Cmns5Ay1ys7IxNxs/ZLUUekjUWkP1dsZB6QQCZ/AmlstyvPT2LM/OVTta6h2\nPebWoZd5AgMBAAECggEABoQXak+k5vcPj5FU7uKNDo7MoBER0NrVWwwdEit9+xXV\n7Rn37Kf2dFLReLxP7EufFp/8mOkJJhoiUg/flCIUd6kUbQJjUKISA4ZLXZ4+dRDp\nPJ+1ZAW/BrJio3BnMDcprHNpcHj7yYo8JJl1O7FXNLrHpoStf0D6GqI3x5A54L7O\nlzRlS3SKAh4RAep0aWiKunRBVnRExhbvhotn9NqsvESmnoNWuKgJtraVN4NqifRh\nAnzAUP2tHhkilimcJ3e6oTl9xhz8UMprQg+mdtcvb5feFUBHRog+27/aXrRfrRr6\nkD1yo3WCmz2ILeo7tX6XHG6qe5WrGPui0YuJ2i5xPQKBgQD3Fh831d9+yS/JGKSu\nElQzEZXrUl+yb24J0IKj+7r6vxK+/f9dp2onSbxPZ4sZ/C8aet+v04mIvjcHzmvu\noK/FuLIyo/bfyBTvZ/D5ysE5gSwpHNWhjleTW4DVaZ6+PSfv68krXrQDXbxYl7lY\nvSG+lQFPl7z4nvwecHfKw6VLrQKBgQDKJO2TZ6XnUz4xNI6Xth2LZvzmECzCb5Ob\nuPtz654wHYnNSpFmvQ3CkvvsiD/iyuwHDQB90KNT8Ex+6T2EDH2XXBsyY9XkieKV\nyHz6U3sv65wXC/n/jC5BfuFXn8Wh2gJUayG5ec4MvWWlBxZUX9eKrvIu9oFH6Hnp\n2f0JA060fQKBgQDXBWFVbcF4zAvRrKhi84BikMMubhjpZx8TW2jU25Pz8aOWoeNA\n1RgD6J7/WtQqYNN878EJecUOQroRCQnUN/G+1uP8PcPxKmVNkd6bAl70c/zCKl2e\nogiEK/UJw0hptT60AzSlkVyGMWRelGqvVqeu+myRnzLMCU7ODoGw6mFGYQKBgF5E\n+HJsvMbzYCaMTw9bQ831+mzEEEugwyK1ErcNo5jmvZP6eXKDKf6ak1fMdpaqcYYc\nPyVtfi2v+8yXszN4q71BnAFU47QPxZZ6iCYpdmJzqzhoQm81jYDHzgkSHpWLWNjL\nmU+pCTmRvexHMNeqVpd7XMAf/0xskyZGnaVtYG/1AoGAGBY5etmKTQ7duRk3joiB\nzsJE098ZCjrq0N13/V/hJmHyi3VeSHQEXY36kBFemokv8Vf8DY1TxH8MCAjhDHUS\niAcGaV688nnJN/mDouMzuf/kR8/fAIl5K7Zw59Fn4hPdSPYLqPcyQbx05NQdWIL5\n5wyanUI77Ca1dwqj5LHDh7Y=\n-----END PRIVATE KEY-----\n';

// as per goolgle json
    let clientEmail = "osi-758@osidigital-12a7f.iam.gserviceaccount.com";
    let config = {
        credentials: {
            private_key: privateKey,
            client_email: clientEmail
        }
    }
    const sessionClient = new dialogflow.SessionsClient(config);

    // Define session path
    const sessionPath = sessionClient.sessionPath(projectId, sessionId);

    // The text query request.
    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: query,
                languageCode: languageCode,
            },
        },
    };

// Send request and log result
sessionClient
  .detectIntent(request)
  .then(responses => {
  	const result = responses[0].queryResult;
    const messageObj = result.fulfillmentText;
    const message = result.fulfillmentMessages;


    console.log(`Query: ${result.queryText}`);
    var messages = '';
    
    console.log(Object.keys(message));


    if(messageObj !== '')
    {
    	// messages.push(messageObj)
    	messages = messages + messageObj;
    }
    else if(message !== '')
    {
        message.forEach(doc => 
        {
        console.log(doc);
        if (doc.message == 'text'){
            console.log('text');
            messages = messages + doc.text.text +'<br>';
        }else if(doc.message == 'quickReplies'){
            const docs = doc.quickReplies['quickReplies']
            docs.forEach(suggestions => {
                // messages = messages + '<li>'+suggestions+'</li>';
                // messages = messages + '<li><span class="action-elem"><button onclick="javascript:autosubmit('+suggestions+' , true)">'+suggestions+'</button></span></li>'
                console.log(typeof(suggestions));
                var a = "'"+suggestions+"'";
                messages = messages + '<button type="submit" data-button-lifecycle="true" data-radio="" data-button-index="1" class="btn btn-primary btn-sm btn-block" data-type="text" onclick="autosubmit('+a+' , true)" >'+suggestions+'</button>'    //disableAllCardButtons(this);
                
                console.log(suggestions);
            });
        }else if(doc.message == 'card'){
            const link = doc.card.imageUri;
            messages = messages + '<a href="https://osidigital.com/about/our-people/" target="_blank"><img src="'+link+'" alt="Smiley face" height="20%" width="100%"></a><br>';

        }
       
        });
	}
	// console.log(messages);
   console.log('------------------------------------------------------------------------------------------');
    // reply = {"text":`${result.fulfillmentText}`};
    reply = {"text":`${messages}`};
    // console.log(reply);
    res.send(reply);
    if (result.intent) {
      
      console.log(`  Intent: ${result.intent.displayName}`);
    } else {
      console.log(`  No intent matched.`);

    }
  })
  .catch(err => {
    console.error('ERROR:', err);
  });

    //var message = req.query.msg;   
        // A unique identifier for the given session   
    // console.log(req.query.msg);
    // reply = {"text":"welcome"};
    // res.send(reply);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));