var express = require('express');
var router = express.Router();
var AWS = require('aws-sdk')
const config = new AWS.Config({
	accessKeyId: process.env.AWS_REKOGNITION_ID,
	secretAccessKey: process.env.AWS_REKOGNITION_SECRET,
	region: process.env.AWS_REKOGNITION_REGION,
})
var s3 = new AWS.S3(config);
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
var ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

var streamBuffers = require('stream-buffers');
const fs = require('fs');

const rekognition = require('./rekognition');
const { resolve } = require('path');
const {createTranscription} = require('./transcribe');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
const uploadVideo = async (id, body) => {
	const bucketStreamParams = {
		Bucket: process.env.AWS_REKOGNITION_BUCKET,
		Key: `${id}/video.mp4`,
		Body: body
	}
	return new Promise((resolve, reject) => {
		s3.putObject(bucketStreamParams, function (perr, pres) {
			if (perr) {
				console.log("Error uploading data: ", perr);
				reject('upload video error');
			} else {
				console.log("Successfully uploaded video");
				resolve();
			}
		});
	});
}

const makeSnapShots = (id, readStream) => {
	// Set up the ffmpeg process
	return new Promise((resolve, reject) => { 
		ffmpeg(readStream)
			.output(`output_image/${id}/screenshot-%04d.jpg`)
			.outputOptions(
				'-q:v', '8',
				'-vf', 'fps=1/10,scale=-1:360'
			)
			.on('end', async () => {
				resolve(uploadSnapshots(id));
			})
			.run();
	});
}

const uploadSnapshots = async (id) => {
	return new Promise((resolve, reject) => {
		fs.readdir(`output_image/${id}`, async (err, files) => {
			const promises = files.map((file) => {
				return new Promise((resolve, reject) => {
					const bucketStreamParams = {
						Bucket: process.env.AWS_REKOGNITION_BUCKET,
						Key: `${id}/${file}`,
						Body: fs.readFileSync(`output_image/${id}/${file}`)
					}
					s3.putObject(bucketStreamParams, function (perr, pres) {
						if (perr) {
							console.log("Error uploading data: ", perr);
							reject('upload snapshots error');
						} else {
							console.log(`Successfully uploaded ${file}`);
							resolve();
						}
					});
				});
			});
			Promise.all(promises).then(() => {
				resolve(files);
			});
		});
	});
}

router.post('/upload', async (req, res, next) => {
	// random id of these video, use as folder name both in local and s3 (not handle case of duplicate id)
	const id = Math.floor(Math.random() * 10000000)
	console.log(id);

	fs.mkdirSync(`output_image/${id}`, { recursive: true })
	const file = req.files.File;
	try{
		await uploadVideo(id, file.data);
		await createTranscription(`s3://${process.env.AWS_REKOGNITION_BUCKET}/${id}/video.mp4`);
	}catch(err){
		console.log(err)
	}
	
	// Retrieve object stream
	const readStream = new streamBuffers.ReadableStreamBuffer({
		frequency: 1,      // in milliseconds.
		chunkSize: 1048576     // in bytes.
	  }); 
	readStream.push(file.data);
	readStream.push(null);

	const pictures = await makeSnapShots(id, readStream);
	const rekognitionResult = await rekognition.getEmotionFromSnapshots(id, pictures);
	
	res.send({rekognition: rekognitionResult});
});

module.exports = router;
