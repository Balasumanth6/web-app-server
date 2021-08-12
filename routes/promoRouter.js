const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Promos = require('../models/promos');

const promotionsRouter = express.Router();

promotionsRouter.use(bodyParser.json());

promotionsRouter.route('/')
.options(cors.corsWithOptions, (req, res) => {
	res.sendStatus(200);
})
.get(cors.cors, (req, res, next) => {
	Promos.find(req.query)
	.then((promos) => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(promos);
	}, (err) => next(err))
	.catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {authenticate.verifyAdmin(req, res, next)}, (req, res, next) => {
	Promos.create(req.body)
	.then((promo) => {
		console.log('Promo Created ', promo);
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(promo);
	}, (err) => next(err))
	.catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {authenticate.verifyAdmin(req, res, next)}, (req, res, next) => {
	res.statusCode = 403;
	res.end('PUT operation not supported on /promotions');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {authenticate.verifyAdmin(req, res, next)}, (req, res, next) => {
	Promos.remove({})
	.then((resp) => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(resp);
	}, (err) => next(err))
	.catch((err) => next(err));
});



///
promotionsRouter.route('/:promoId')
.options(cors.corsWithOptions, (req, res) => {
	res.sendStatus(200);
})
.get(cors.cors, (req, res, next) => {
	Promos.findById(req.params.promoId)
	.then((promo) => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(promo);
	}, (err) => next(err))
	.catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {authenticate.verifyAdmin(req, res, next)}, (req, res, next) => {
	res.statusCode = 403;
	res.end('POST operation not supported on /promotions/' + req.params.promoId);
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {authenticate.verifyAdmin(req, res, next)}, (req, res, next) => {
	Promos.findByIdAndUpdate(req.params.promoId, {
		$set: req.body
	}, { new: true })
	.then((promo) => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(promo);
	}, (err) => next(err))
	.catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {authenticate.verifyAdmin(req, res, next)}, (req, res, next) => {
	Promos.findByIdAndRemove(req.params.promoId)
	.then((resp) => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(resp);
	}, (err) => next(err))
	.catch((err) => next(err));
});

module.exports = promotionsRouter;
