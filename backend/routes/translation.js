var express = require('express');
var router = express.Router();
const { AWSTranslateJSON } = require('aws-translate-json');

const awsConfig = {
  accessKeyId: process.env.AWS_TRANSLATE_ID,
  secretAccessKey: process.env.AWS_TRANSLATE_SECRET,
  region: process.env.AWS_TRANSLATE_REGION,
}

const source = "en";
const target = ["th", "ja"];

const { translateJSON } = new AWSTranslateJSON(awsConfig, source, target);

router.post('/', async (req, res, next) => {
  const translated = await translateJSON({ key: req.body.key });
  res.send(translated);
});

module.exports = router;
