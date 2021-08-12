const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const multer = require('multer');
const cors = require('./cors');

const storage = multer.diskStorage({
	destination: (req, file, callback) => {
		callback(null, 'public/images');
	},

	filename: (req, file, callback) => {
		callback(null, file.originalname)
	} 
});

const imageFileFilter = (req, file, callback) => {
	if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
		return callback(new Error("you can upload only image files!"), false);
	}
	else {
		callback(null, true);
	}
};

const upload = multer({ storage: storage , fileFilter: imageFileFilter});

const uploadRouter = express.Router();

uploadRouter.use(bodyParser.json());

uploadRouter.route('/')
.options(cors.corsWithOptions, (req, res) => {
	res.sendStatus(200);
})
.get(cors.cors, authenticate.verifyUser, (req, res, next) => authenticate.verifyAdmin(req, res, next), 
	(req, res, next) => {
		res.statusCode = 403;
		res.end('GET operation not supported on /imageUpload');
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {authenticate.verifyAdmin(req, res, next)}, 
	(req, res, next) => {
		res.statusCode = 403;
		res.end('PUT operation not supported on /imageUpload');
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {authenticate.verifyAdmin(req, res, next)}, 
	upload.single('imageFile'), (req, res) => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(req.file);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {authenticate.verifyAdmin(req, res, next)}, 
	(req, res, next) => {
		res.statusCode = 403;
		res.end('DELETE operation not supported on /imageUpload');
})
module.exports = uploadRouter;