var express = require('express');
var router = express.Router();

var AWS = require('aws-sdk')
const config = new AWS.Config({
	accessKeyId: process.env.AWS_REKOGNITION_ID,
	secretAccessKey: process.env.AWS_REKOGNITION_SECRET,
	region: process.env.AWS_REKOGNITION_REGION,
})
var s3 = new AWS.S3(config);
var ffmpeg = require('fluent-ffmpeg');
var streamBuffers = require('stream-buffers');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/upload', async (req, res, next) => {
	const file = req.files.File;
	// const params = {
	// 	Bucket: process.env.AWS_REKOGNITION_BUCKET,
	// 	Key: file.name,
	// 	Body: file.data
	// }
	// s3.putObject(params, function (perr, pres) {
	// 	if (perr) {
	// 		console.log("Error uploading data: ", perr);
	// 	} else {
	// 		console.log("Successfully uploaded data to myBucket/myKey");
	// 	}
	// });

	// const params = {
	// 	Bucket: process.env.AWS_REKOGNITION_BUCKET,
	// 	Key: 'test.mp4',
	// }

	// Retrieve object stream
	// let readStream = s3.getObject(params).createReadStream();
	var readStream = new streamBuffers.ReadableStreamBuffer({
		frequency: 1,      // in milliseconds.
		chunkSize: 1048576     // in bytes.
	  }); 
	readStream.put(file.data);

	// Set up the ffmpeg process
	let ffmpegProcess = new ffmpeg(readStream)
		//Add your args here
		.on('end', function() {
			console.log('Screenshots taken');
		  })
		  .output('output_image/screenshot-%04d.png')
		  .outputOptions(
			  '-q:v', '8',
			  '-vf', 'fps=1/10,scale=-1:360',
		  )
		  .run()
	res.send({test: 'test'});
});

module.exports = router;
