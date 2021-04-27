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
const createTranscription = (uri, id)=>{
  return new Promise((resolve,reject)=>{
    const params = {
      Media: {
        /* required */
        MediaFileUri: uri
      },
      TranscriptionJobName: id,
      LanguageCode : "es-US",
    };
    transcribeService.startTranscriptionJob(params, function(err, data) {
      if (err) reject(err);
      // an error occurred
      else {
        console.log("create transcription successs")
        return resolve(data);
      } // successful response
    });
  });
}

const getTranscription = async (id)=>{
  return new Promise((resolve, reject) => {
    var params= {
      TranscriptionJobName: id /* required */
    };
    
    return transcribeService.getTranscriptionJob(params, async function(err, data) {
      if (data.TranscriptionJob.TranscriptionJobStatus === 'COMPLETED') {
        const result = await axios.get(data.TranscriptionJob.Transcript.TranscriptFileUri);
        
        const transcription = {
          Transcript: result.data.results.transcripts[0].transcript,
          LanguageCode: result.data.results.language_code,
          TranscriptionJobStatus: "COMPLETED",
        };
        return resolve(transcription); // successful response
      }
      else {
        return resolve({
          TranscriptionJobStatus:"INCOMPLETED",
        });
      } 
    });
  });
}
router.get("/", async function(req, res, next) {
    
  let result = await getTranscription()
  res.send(result)

});
transcribeRouter = router
module.exports = {transcribeRouter,createTranscription,getTranscription};
