'use strict'

const mongoose = require('mongoose');
const app = require('./app');
const port = 3900;

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/api_rest_blog', { useNewUrlParser: true })
.then(() => {
    console.log('La conexion a la base de datos ha sido realizada correctamente!!!');

    // Create Server and listen suggest HTTP
    app.listen(port, () => {
        console.log('running Server on http://localhost:'+port);
    });
});
