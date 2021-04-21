var express = require("express");
var router = express.Router();
const AWS = require("aws-sdk");
const dotenv = require("dotenv");
var axios = require("axios");
dotenv.config();

const config = new AWS.Config({
  accessKeyId: process.env.AWS_TRANSCRIBE_ID,
  secretAccessKey: process.env.AWS_TRANSCRIBE_SECRET,
  region: process.env.AWS_TRANSCRIBE_REGION
});
/* GET users listing. */
const transcribeService = new AWS.TranscribeService(config);
router.post("/", function(req,res,next){
    let uri = req.body.uri
    const params = {
        Media: {
          /* required */
          MediaFileUri: uri
        },
        TranscriptionJobName: Date.now().toString(),
        IdentifyLanguage: true
      };
      transcribeService.startTranscriptionJob(params, function(err, data) {
        if (err) console.log(err, err.stack);
        // an error occurred
        else console.log(data); // successful response
      });
})
router.get("/", async function(req, res, next) {
    
  const params = {
    MaxResults: 1 /* required */
  };
  var params2= {
    TranscriptionJobName: "" /* required */
  };
  
  try{
    transcribeService.listTranscriptionJobs(params,function(err, data) {
      if (err) throw err // an error occurred
      else{
        // console.log(data.TranscriptionJobSummaries[0].TranscriptionJobName); 
        params2.TranscriptionJobName = data.TranscriptionJobSummaries[0].TranscriptionJobName
        transcribeService.getTranscriptionJob(params2, async function(err, data) {
          if (err) throw err
          // an error occurred
          else{
              let uri = await data.TranscriptionJob.Transcript.TranscriptFileUri
              axios.get(uri).then(result=>{
                // console.log(result.data.results.transcripts[0].transcript)
                res.json({
                  transcript:result.data.results.transcripts[0].transcript,
                  language_code:result.data.results.language_code
                }) // successful response
              })
              
          } 
        });
      }
    });
    
  }catch(err){
    console.log(err,err.stack)
  }
  
  
  
});

module.exports = router;
