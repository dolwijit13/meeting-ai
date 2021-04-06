var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/upload', async (req, res, next) => {
	console.log(req.body);
	res.send({test: 'test'});
});

module.exports = router;
