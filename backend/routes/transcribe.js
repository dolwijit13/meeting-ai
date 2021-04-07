var express = require("express");
var router = express.Router();
const AWS = require("aws-sdk");
const dotenv = require("dotenv");

dotenv.config();

const config = new AWS.Config({
  accessKeyId: process.env.AWS_TRANSCRIBE_ID,
  secretAccessKey: process.env.AWS_TRANSCRIBE_SECRET,
  region: process.env.AWS_TRANSCRIBE_REGION
});
/* GET users listing. */
const transcribeService = new AWS.TranscribeService(config);
router.post("/", function(req,res,next){
    const params = {
        Media: {
          /* required */
          MediaFileUri:
            "s3://cloundcompfinalproject2021/agenda and meeting minutes templates.mp4"
        },
        TranscriptionJobName: "test",
        IdentifyLanguage: true
      };
      transcribeService.startTranscriptionJob(params, function(err, data) {
        if (err) console.log(err, err.stack);
        // an error occurred
        else console.log(data); // successful response
      });
})
router.get("/", function(req, res, next) {
    
  const params = {
    TranscriptionJobName: "test" /* required */
  };
  transcribeService.getTranscriptionJob(params, async function(err, data) {
    if (err) console.log(err, err.stack);
    // an error occurred
    else{
        let uri = await data.TranscriptionJob.Transcript.TranscriptFileUri
        res.redirect(uri); // successful response
    } 
  });
  
});

module.exports = router;
