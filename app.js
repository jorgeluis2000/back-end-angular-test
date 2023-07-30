'use strict'

// Cargar modulos de node para crear servidor

const express = require('express');
const bodyParser = require('body-parser');

// Ejecutar express (http)
const app = express();

// Cargar fichero de rutas
const article_routes = require('./routes/article');

// Middlewares
app.use(bodyParser.urlencoded({ extended:false }));
app.use(bodyParser.json());

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});


// Add Prefix toroute / Load route
app.use('/api', article_routes);

//app.post('/datos-server', (req, res) => {
//    console.log('Hola mundo');
//    var hola = req.body.hola;
//    return res.status(200).send({
//        curso: 'Master in Frameworks JS',
//        autor: 'Jorge Luis Guiza Granobles',
//        URL: 'jorgeguizagranobles.com',
//        hola
//    });
//});

// Export modules (current file)

module.exports = app;