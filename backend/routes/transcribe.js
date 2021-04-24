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
const createTranscription = (uri)=>{
  return new Promise((resolve,reject)=>{
    const params = {
      Media: {
        /* required */
        MediaFileUri: uri
      },
      TranscriptionJobName: Date.now().toString(),
      IdentifyLanguage: true
    };
    transcribeService.startTranscriptionJob(params, function(err, data) {
      if (err) reject(err);
      // an error occurred
      else {
        console.log("create transcription successs")
        return resolve(data);
      } // successful response
    });
  })
    
}

const getTranscription = ()=>{
  return new Promise((resolve,reject)=>{
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
          if (data.TranscriptionJobSummaries[0].TranscriptionJobStatus !== "COMPLETED"){
            return resolve({
              TranscriptionJobName:data.TranscriptionJobSummaries[0].TranscriptionJobName,
              TranscriptionJobStatus:data.TranscriptionJobSummaries[0].TranscriptionJobStatus,
              CreationTime:data.TranscriptionJobSummaries[0].CreationTime,
              LanguageCode:data.TranscriptionJobSummaries[0].LanguageCode
            })
          }
          params2.TranscriptionJobName = data.TranscriptionJobSummaries[0].TranscriptionJobName
          // console.log(data.TranscriptionJobSummaries[0])
          
          transcribeService.getTranscriptionJob(params2, async function(err, data) {
            if (err) throw err
            // an error occurred
            else{
                let uri = await data.TranscriptionJob.Transcript.TranscriptFileUri
                axios.get(uri).then(result=>{
                  // console.log(result.data.results.transcripts[0].transcript)
                  return resolve({
                    Transcript:result.data.results.transcripts[0].transcript,
                    LanguageCode:result.data.results.language_code,
                    TranscriptionJobStatus:"COMPLETED",
                  }) // successful response
                })
                
            } 
          });
        }
      });
      
    }catch(err){
      return reject(err)
    }
  })
}
router.get("/", async function(req, res, next) {
    
  let result = await getTranscription()
  res.send(result)

});
transcribeRouter = router
module.exports = {transcribeRouter,createTranscription,getTranscription};
