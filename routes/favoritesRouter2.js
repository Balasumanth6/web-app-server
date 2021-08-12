const express = require('express');
const bodyParser = require('body-parser');
const cors = require('./cors');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const Favorites = require('../models/favorites');
const Dishes = require('../models/dishes');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
})
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .populate('user')
    .populate('dishes')
    .then((favorites) => {
            console.log('favorites ' + favorites);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            if (favorites === null) 
                res.send('Favorites list is empty!');
            else
                res.json(favorites);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((user) => {
        console.log(user);
        if (user) {
            console.log('ok');
            Favorites.findOne({user: req.user._id})
                .then((fav) => {
                    req.body.dishes.forEach((dish) => {
                        addDishToFavorites(fav, dish.id);
                    });
                    fav.save()
                        .then((resp) => {
                            console.log(resp);
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(resp);
                        });
                });

        } else {
            Favorites.create({user: req.user._id})
                .then((fav) => {
                    req.body.dishes.forEach((dish) => {
                        addDishToFavorites(fav, dish.id);
                    });
                    fav.save()
                        .then((resp) => {
                            console.log(resp);
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(resp);
                        });
                });
        }
    });
})
.put((req, res, next) => {
    res.statusCode = 403;
    res.end('Put operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.remove({user: req.user._id})
        .then((resp) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
        }, (err) => next(err))
        .catch((err) => next(err));
});




favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
})
.get((req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favorites/' + req.params.dishId);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    console.log(req.params.dishId);
    Dishes.findOne({_id: req.params.dishId})
        .populate()
        .then((dish) => {
            Favorites.findOne({user: req.user._id})
                .then((favorite) => {
                    if (favorite) {
                        console.log('user ' + favorite);
                        addDishToFavorites(favorite, dish.id);
                        favorite.save()
                            .then((response) => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(response);
                            }, (err) => next(err))
                    } else {
                        Favorites.create({user: req.user._id})
                            .then((fav) => {
                                addDishToFavorites(fav, dish.id);
                                fav.save()
                                    .then((response) => {
                                        res.statusCode = 200;
                                        res.setHeader('Content-Type', 'application/json');
                                        res.json(response);
                                    }, (err) => next(err));
                            }).catch(() => console.log('Could not create Favorites list'));
                    }
                });
        })
        .catch(() => {
            console.log('Dish ' + req.params.dishId + ' not found');
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 401;
            return next(err);
        });
})
.put((req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /favorites/' + req.params.dishId);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, ((req, res, next) => {
    Favorites.findOne({user: req.user._id})
        .then((fav) => {
            if (fav) {
                console.log(fav);
                let index = fav.dishes.indexOf(req.params.dishId);
                if (index) {
                    let last = fav.dishes.length-1;
                    let temp = fav.dishes[index];
                    fav.dishes[index] = fav.dishes[last];
                    fav.dishes[last] = temp;
                    // console.log(fav.dishes.pop());
                    fav.save()
                        .then((response) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(response);
                        }, (err) => next(err));
                } 
                else {
                    console.log('Dish not found');
                }
            }
        })
}))

function addDishToFavorites(list, dishId) {
    console.log(dishId);
    if (list.dishes.includes(dishId)) {
        console.log('Dish already in Favorites');
    } else {
        list.dishes.push(dishId);
        console.log('Added Dish ' + dishId + ' to Favorites');
    }
}

module.exports = favoriteRouter;