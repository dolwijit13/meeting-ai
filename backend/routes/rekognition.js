var express = require('express');
var router = express.Router();

const AWS = require('aws-sdk')

const config = new AWS.Config({
	accessKeyId: process.env.AWS_REKOGNITION_ID,
	secretAccessKey: process.env.AWS_REKOGNITION_SECRET,
	region: process.env.AWS_REKOGNITION_REGION,
})
const client = new AWS.Rekognition(config);

router.get('/', async (req, res, next) => {
	const params = {
		Image: {
			S3Object: {
				Bucket: process.env.AWS_REKOGNITION_BUCKET,
				Name: 'test.png'
			},
		},
		Attributes: ['ALL']
	};
	client.detectFaces(params, function(err, response) {
		if (err) {
			console.log(err, err.stack); // an error occurred
		} else {
			response = response.FaceDetails.map((faceDetail) => {
				return {
					Emotions: faceDetail.Emotions
				}
			});
			res.send(response);
		}
	});
});

module.exports = router;