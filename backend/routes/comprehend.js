const AWS = require('aws-sdk');

const config = new AWS.Config({
  apiVersion: '2017-11-27',
  accessKeyId: process.env.AWS_COMPREHEND_ID,
  secretAccessKey: process.env.AWS_COMPREHEND_SECRET,
  region: process.env.AWS_COMPREHEND_REGION,
});

const comprehend = new AWS.Comprehend(config);

// router.post('/', async (req, res, next) => {
//     const ret = await Promise.resolve(detectEntity(req.body.text));
//     res.send(ret);
//   });
  
module.exports = {
    detectEntity: async (text) => {
        var params = {
            LanguageCode: 'en',
            Text: text,
        };
        return new Promise((resolve, reject) => {
            comprehend.detectEntities(params, (err, data) => {
                if (err) {
                    console.log(err, err.stack); // an error occurred
                    reject('comprehend error');
                }
                else {
                    resolve(data);
                }
            });
        });
    }
}
