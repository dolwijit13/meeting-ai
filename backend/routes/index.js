var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/upload', async (req, res, next) => {
	console.log(req.files.File)
	const file = req.files.File
	res.send({file});
});

module.exports = router;
