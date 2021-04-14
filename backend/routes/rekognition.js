const AWS = require('aws-sdk')

const config = new AWS.Config({
	accessKeyId: process.env.AWS_REKOGNITION_ID,
	secretAccessKey: process.env.AWS_REKOGNITION_SECRET,
	region: process.env.AWS_REKOGNITION_REGION,
})
const client = new AWS.Rekognition(config);

module.exports = {
	getEmotionFromSnapshots: async (id, pictures) => {
		const promises = pictures.map((picture) => getEmotionFromSnapshot(`${id}/${picture}`));
		const emotions = await Promise.all(promises);
		const averageEmotionFromSnapshots = emotions.reduce((acc, emotion) => {
			for (let [key, value] of Object.entries(emotion)) {
				if(key in acc) acc[key] += value;
				else acc[key] = value;
			}
			return acc;
		}, {});
		return averageEmotionFromSnapshots;
	}
}

const getEmotionFromSnapshot = async (path) => {
	const params = {
		Image: {
			S3Object: {
				Bucket: process.env.AWS_REKOGNITION_BUCKET,
				Name: path
			},
		},
		Attributes: ['ALL']
	};
	return new Promise((resolve, reject) => {
		client.detectFaces(params, function(err, response) {
			if (err) {
				console.log(err, err.stack); // an error occurred
				reject('rekognition error');
			} else {
				// emotions = [emotion of 1'st person, emotion of 2'nd person, ..]
				emotions = response.FaceDetails.map((faceDetail) => faceDetail.Emotions);

				// emotion = {Type: confidence, n: number of person accummulated}
				const averageEmotionFromSnapshot = emotions.reduce((acc, emotion) => {
					emotion.forEach((data) => {
						if(data['Type'] in acc) acc[data['Type']] += data['Confidence'];
						else acc[data['Type']] = data['Confidence'];
					});
					acc['n'] += 1;
					return acc;
				}, {n:0})
				resolve(averageEmotionFromSnapshot);
			}
		});
	});
}