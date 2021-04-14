const AWS = require('aws-sdk')

const config = new AWS.Config({
	accessKeyId: process.env.AWS_REKOGNITION_ID,
	secretAccessKey: process.env.AWS_REKOGNITION_SECRET,
	region: process.env.AWS_REKOGNITION_REGION,
})
const client = new AWS.Rekognition(config);

module.exports = {
	getEmotions: (id, pictures) => {
		console.log(id, pictures);
		// return getEmotion(`${id}/${pictures[0]}`)
	}
}

const getEmotion = (path) => {
	const params = {
		Image: {
			S3Object: {
				Bucket: process.env.AWS_REKOGNITION_BUCKET,
				Name: path
			},
		},
		Attributes: ['ALL']
	};
	return client.detectFaces(params, function(err, response) {
		if (err) {
			console.log(err, err.stack); // an error occurred
		} else {
			response = response.FaceDetails.map((faceDetail) => {
				return {
					Emotions: faceDetail.Emotions
				}
			});
			return response
		}
	});
}