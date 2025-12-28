const express = require('express');
const IndexController = require('../controllers/index');

const router = express.Router();
const indexController = new IndexController();

function setRoutes(app) {
    router.get('/', indexController.home.bind(indexController));
    router.post('/search', indexController.search.bind(indexController));
    router.get('/about', indexController.about.bind(indexController));
    // Add more routes as needed

    app.use('/', router);
}

module.exports = setRoutes;