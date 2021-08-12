const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');
const Favorites = require('../models/favorites.js');

const favoritesRouter = express.Router();

favoritesRouter.use(bodyParser.json());

favoritesRouter.route('/')
.options(cors.corsWithOptions, (req, res) => {
	res.sendStatus(200);
})
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
	Favorites.find({})
	.populate('dishes')
	.populate('user')
	.then(favorites => {
		if (favorites) {
			var userFavorites;
			userFavorites = favorites.filter(fav => fav.user._id.toString() === req.user._id.toString())[0];
			if (!userFavorites) {
				err = new Error('No favorites found!');
	            err.status = 404;
	            return next(err)
			}
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.json(userFavorites);
		}
		else {	
            var err = new Error('There are no favourites');
            err.status = 404;
            return next(err);
		}
	}, (err) => next(err))
	.catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
	Favorites.find({})
	.populate('dishes')
	.populate('user')
	.then(favorites => {
		var userFavorites;
		if (favorites) 
			userFavorites = favorites.filter(fav => fav.user._id.toString() === req.user._id.toString())[0];

		if(!userFavorites) 
			userFavorites = Favorites.create({ user: req.user._id });

		for(const i of Object.keys(req.body)) {
			console.log(i, req.body[i]);
           	if(userFavorites.dishes.find((d_id) => {
                if(d_id._id){
                    return d_id._id.toString() === req.body[i].toString();
                }
            })) {
            	continue;
            }
            userFavorites.dishes.push(req.body._id);
        }
        userFavorites.save()
		.then((userFavorites) => {
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.json(userFavorites); 
		}, (err) => next(err))
		.catch((err) => next(err));
	}, (err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation is not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
	Favorites.find({})
	.populate('dishes')
	.populate('user')
	.then((favorites) => {
		var favToRem;
		if (favorites) {
			favToRem = favorites.filter(fav => fav.user._id.toString() === req.user._id.toString())[0];
		}
		if (favToRem) {
			favToRem.remove()
			.then((result) => {
				res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(result);
			}, (err) => next(err));
		}
		else {
	        var err = new Error('You do not have any favorites');
	        err.status = 404;
	        return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})






//:DishId
favoritesRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => {
	res.sendStatus(200);
})
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
	Favorites.findOne({user: user.req._id})
	.populate('dishes')
	.populate('user')
	.then((favorites) => {
		if (!favorites) {
			const favs = favorites.filter(fav => fav.user._id.toString() === req.user._id.toString())[0];
            const dish = favs.dishes.filter(favDish => favDish._id.toString() === req.params.dishId.toString())[0];
            if (dish){
				res.statusCode = 200;
	            res.setHeader('Content-Type', 'application/json');
	            res.json(dish);
            }
            else {
            	var err = new Error('You do not have dish ' + req.params.dishId);
                err.status = 404;
                return next(err);
            }
		}
		else {
			var err = new Error('You do not have dish ' + req.params.dishId);
            err.status = 404;
            return next(err);
		}
	}, (err) => next(err))
	.catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
	err = new Error('PUT Operation not Permitted!');
    err.status = 403;
    return next(err);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
	Favorites.find({})
	.populate('dishes')
	.populate('user') 
	.then((favorites) => {
		var userFavorites;
		if(favorites)
			userFavorites = favorites.filter(fav => fav.user._id.toString() === req.user._id.toString())[0];

		if(!userFavorites) 
			userFavorites = Favorites.create({ user: req.user._id });

       	if(!userFavorites.dishes.find((favDishId) => {
            if(favDishId._id){
                return favDishId._id.toString() === req.params.dishId.toString();
            }
        })) 
        	userFavorites.dishes.push(req.params.dishId);

        userFavorites.save()
		.then((userFavorites) => {
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.json(userFavorites); 
		}, (err) => next(err))
		.catch((err) => next(err));
	}, (err) => next(err))
	.catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
	Favorites.findOne({user: req.user._id})
	.populate('dishes')
	.populate('user') 
	.then((userFavorites) => {
		// var userFavorites;
		// if (favorites)
		// 	userFavorites = favorites.filter(fav => fav.user._id.toString() === req.user._id.toString())[0];
		if (userFavorites) {
			userFavorites.dishes = userFavorites.dishes.filter((dishid) => dishid._id.toString() !== req.params.dishId);
			userFavorites.save()
	        .then((result) => {
	            res.statusCode = 200;
	            res.setHeader("Content-Type", "application/json");
	            res.json(result);
	        }, (err) => next(err));
		}
		else {
            var err = new Error('You do not have any favourites');
            err.status = 404;
            return next(err);
        }
	}, (err) => next(err))
	.catch((err) => next(err));
})

module.exports = favoritesRouter;