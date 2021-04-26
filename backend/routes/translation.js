const { AWSTranslateJSON } = require('aws-translate-json');

const awsConfig = {
  accessKeyId: process.env.AWS_TRANSLATE_ID,
  secretAccessKey: process.env.AWS_TRANSLATE_SECRET,
  region: process.env.AWS_TRANSLATE_REGION,
}

const source = "en";
const target = ["th", "ja"];

const { translateJSON } = new AWSTranslateJSON(awsConfig, source, target);

module.exports = {
  translate: async (key) => {
    const translated = await translateJSON({ key });
    return { en: {key}, ...translated};
  }
};
