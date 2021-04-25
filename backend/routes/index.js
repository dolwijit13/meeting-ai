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
const {createTranscription, getTranscription} = require('./transcribe');
const { translate } = require('./translation');
const { detectEntity } = require('./comprehend');

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
		await createTranscription(`s3://${process.env.AWS_REKOGNITION_BUCKET}/${id}/video.mp4`, id.toString());
  } catch(err){
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
    
    // Mock data for rekognition
    // const rekognitionResult = {
    //   n: 44,
    //   CALM: 3577.4946298599243,
    //   CONFUSED: 377.90401819348335,
    //   HAPPY: 110.66876581311226,
    //   SAD: 56.989723563194275,
    //   SURPRISED: 147.7896904014051,
    //   DISGUSTED: 57.236783377826214,
    //   FEAR: 33.428870042786,
    //   ANGRY: 38.48751028627157
    // }
    
    res.send({rekognition: rekognitionResult, id});
});

router.get('/getdata/:id', async (req, res, next) =>{
	try{
    const id = req.params.id;
		const transcription = await getTranscription(id);
    
    // Mock data for transcription
    // const transcription = {
    //   Transcript: `Hey guys, we will discuss the annual tour this year. It will be held after we all graduate in May. Where should we go first? Let's discuss what type of landscape we will choose between sea and mountains. Right here we have. I go with choice E. I love the beach view. It's so relaxing when you hear the sound of the sea. You know I love the sea to they never been there for a long time. It's nice and the weather is warm. Yeah it's true. But do not let this distract you from the fact that camping on the mountain speak and see the sunrise is also the best thing you cannot miss during long holiday. I agree with D. But I prefer the sea. So if we all go to the beach, is that okay for D. Yeah sure. Why not? Let's have fun there big guy. So we decided to go to the beach. Right. Yes. Do you have 
    //   any good place? I heard that wahine has some great views and a pool within. Also 
    //   with seafood barbecue. This place is a good choice to choose. Phuket is not bad. 
    //   It also has a splendid view. We can enjoy the sunset at the edge, but it may be more expensive than who he. Your opinion sounds good. Seafood is my favorite, but 
    //   if I remember correctly, you are allergic to seafood. Right? Yeah. I am allergic 
    //   to seafood but I can eat fish. So don't worry about that due to the distance while he is not far from Bangkok. So we can save the cost. I also agree with C. All right. We decided to go to who are heating and we will talk about accommodation next time. Thank you all for today.`
    // }
		
		if (transcription === null || transcription.TranscriptionJobStatus != "COMPLETED"){
      // send sth to tell client that it hasn't finished
			return res.send({status: "INCOMPLETED"})
		}
    
    const translation = await translate(transcription.Transcript);

    // Mock data for translation
    // const translation = {
    //   en: {
    //     key: `Hey guys, we will discuss the annual tour this year. It will be held after we all graduate in May. Where should we go first? Let's discuss what type of landscape we will choose between sea and mountains. Right here we have. I go with choice E. I love the beach view. It's so relaxing when you hear the sound of the sea. You know I love the sea to they never been there for a long time. It's nice and the weather is warm. Yeah it's true. But do not let this distract you from the fact that camping on the mountain speak and see the sunrise is also the best thing you cannot miss during long holiday. I agree with D. But I prefer the sea. So if we all go to the beach, is that okay for D. Yeah sure. Why not? Let's have fun there big guy. So we decided to go to the beach. Right. Yes. Do you have 
    //     any good place? I heard that wahine has some great views and a pool within. Also 
    //     with seafood barbecue. This place is a good choice to choose. Phuket is not bad. 
    //     It also has a splendid view. We can enjoy the sunset at the edge, but it may be more expensive than who he. Your opinion sounds good. Seafood is my favorite, but 
    //     if I remember correctly, you are allergic to seafood. Right? Yeah. I am allergic 
    //     to seafood but I can eat fish. So don't worry about that due to the distance while he is not far from Bangkok. So we can save the cost. I also agree with C. All right. We decided to go to who are heating and we will talk about accommodation next time. Thank you all for today.`
    //   },
    //   th: {
    //     key: `Hey guys, เราจะหารือเกี่ยวกับทัวร์ประจำปีในปีนี้.มันจะจัดขึ้นหลังจากที่
    // เราทุกคนจบการศึกษาใน พ.เราควรไปที่ไหนก่อนดีลองหารือเกี่ยวกับประเภทของภูมิทัศน์ที่
    // เราจะเลือกระหว่างทะเลและภูเขาตรงนี้เรามีฉันไปกับทางเลือกอีฉันรักวิวชายหาดมันผ่อนค
    // ลายมากเมื่อคุณได้ยินเสียงของทะเลคุณรู้ว่าฉันรักทะเลที่พวกเขาไม่เคยอยู่ที่นั่นมานา
    // นแล้วมันดีและสภาพอากาศอบอุ่นใช่มันเป็นเรื่องจริงแต่อย่าปล่อยให้เรื่องนี้หันเหความ
    // สนใจไปจากการตั้งแคมป์บนภูเขาพูดและชมพระอาทิตย์ขึ้นก็เป็นสิ่งที่ดีที่สุดที่คุณไม่ค
    // วรพลาดในช่วงวันหยุดยาวนี้ฉันเห็นด้วยกับดี แต่ฉันชอบทะเลมากกว่าดังนั้นถ้าเราทุกคนไ
    // ปที่ชายหาด มันโอเคสำหรับ D.ทำไมล่ะมาสนุกกันที่นั่น ไอ้ตัวใหญ่ดังนั้นเราจึงตัดสินใ
    // จที่จะไปที่ชายหาดใช่ใช่คุณมีที่ที่ดีไหมผมได้ยินมาว่า wahine มีมุมมองที่ดีบางอย่าง
    // และสระว่ายน้ำภายใน.นอกจากนี้ยังมีบาร์บีคิวซีฟู้ดด้วยสถานที่แห่งนี้เป็นทางเลือกที่
    // ดีในการเลือกภูเก็ตไม่เลวนอกจากนี้ยังมีทัศนียภาพที่สวยงามเราสามารถเพลิดเพลินกับพระ
    // อาทิตย์ตกที่ขอบ, แต่มันอาจจะมีราคาแพงกว่าที่เขา.ความคิดเห็นของคุณฟังดูดีอาหารทะเล
    // เป็นที่ชื่นชอบของฉัน แต่ถ้าฉันจำได้อย่างถูกต้องคุณจะแพ้อาหารทะเลใช่มั้ย?ใช่ฉันแพ้
    // อาหารทะเล แต่ฉันกินปลาได้ดังนั้นไม่ต้องกังวลเกี่ยวกับที่เนื่องจากระยะทางในขณะที่เ
    // ขาอยู่ไม่ไกลจากกรุงเทพฯเพื่อที่เราจะได้ประหยัดค่าใช้จ่ายฉันเห็นด้วยกับซีก็ได้เราต
    // ัดสินใจที่จะไปที่ผู้ที่มีความร้อนและเราจะพูดคุยเกี่ยวกับที่พักในครั้งต่อไปขอบคุณท
    // ุกท่านสำหรับวันนี้`
    //   },
    //   ja: {
    //     key: `みんな、今年は毎年恒例のツアーについて話し合う。５月に全員卒業してから 
    // 開催されます。先はどこに行くべきですか？海と山の間でどのような風景を選ぶのか議論 
    // しましょう。ここにいる私は選択Eで行く。ビーチビューが大好き。海の音が聞こえるとと
    // てもリラックスできる。彼らは長い間そこにいたことがない海を愛してるだろいいし、天 
    // 気は暖かいです。ああ、それは本当だ。しかし、これは山でのキャンプが話し、日の出を 
    // 見るという事実からあなたをそらさせないでください。また、長い休日の間に見逃すこと 
    // はできない最高のものです。私はDに同意しますが、私は海の方が好きです。だからみんな
    // ビーチに行けばDは大丈夫ですかなぜじゃない？大物あそこ楽しもうだから私たちはビーチ
    // に行くことにしました。正しいはいいい場所ある？ワヒネには素晴らしい景色とプールが 
    // あるって聞きました。シーフードバーベキューも。この場所は選ぶのに良い選択です。プ 
    // ーケットは悪くないまた、素晴らしい景色を眺めることができます。私たちは端で夕日を 
    // 楽しむことができますが、それは誰よりも高価かもしれません。あなたの意見はよさそう 
    // だなシーフードは私のお気に入りですが、正しく覚えていれば、魚介類にアレルギーがあ 
    // ります。そうですか？ああ魚介類アレルギーですが、魚は食べられます。だから、彼がバ 
    // ンコクから遠く離れていない間、そのことは心配しないでください。だから私たちはコス 
    // トを節約することができます。私はCにも同意します。私たちは暖房している人に行くこと
    // にしました。次回は宿泊施設についてお話します。今日は皆ありがとう。`
    //   }
    // }

    const entities = await Promise.resolve(detectEntity(transcription.Transcript));

    // Mock data for entitries detection
    // const entities = {
    //   "Entities": [
    //     {
    //       "Text": "today",
    //       "Score": 0.97,
    //       "Type": "DATE",
    //       "BeginOffset": 14,
    //       "EndOffset": 19
    //     },
    //     {
    //       "Text": "Seattle",
    //       "Score": 0.95,
    //       "Type": "LOCATION",
    //       "BeginOffset": 23,
    //       "EndOffset": 30
    //     }
    //   ],
    //   "LanguageCode": "en"
    // };

		return res.send({ status: "COMPLETED", translation, entities })
	}catch(err){
		console.log(err)
		res.status(500)
		res.send(err)
	}
});

module.exports = router;
