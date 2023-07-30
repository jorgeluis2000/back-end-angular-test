'use strict'

var validator = require('validator');
var Article = require('../models/article');
var fs = require('fs');
var path = require('path');

var controller = {

    datosCurso: (req, res) => {
        console.log('Hola mundo');
        var hola = req.body.hola;
        return res.status(200).send({
            curso: 'Master in Frameworks JS',
            autor: 'Jorge Luis Guiza Granobles',
            URL: 'jorgeguizagranobles.com',
            hola
        });
    },
    test: (req, res) => {
        return res.status(200).send({
            message: "Soy el metodo test del controlador de articulos"
        });
    },
    save: (req, res) => {
        // Recoger parametros por post
        var params = req.body;
        // Validar datos (validator)
        try {

            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
        } catch (err) {
            return res.status(200).send({
                status: false,
                message: 'Faltan datos por enviar'
            });
        }

        if (validate_title && validate_content) {
            // Crear el objeto a guardar
            var article = new Article();
            // Asignar valores
            article.title = params.title;
            article.content = params.content;
            if(params.image) {
                article.image = params.image;
            } else {
                article.image = null;
            }
            // Guardar el articulo
            article.save((err, articleStored) => {
                if (err || !articleStored) {
                    return res.status(404).send({
                        status: false,
                        message: 'El articulo no se ha guardado'
                    });
                }
                // Devolver una respuesta
                return res.status(200).send({
                    status: true,
                    article: articleStored
                });

            });
        } else {
            return res.status(200).send({
                status: false,
                message: 'Los datos no son validos !!!'
            });
        }
    },
    getArticles: (req, res) => {

        var query = Article.find({});
        var params = req.params;
        if (params || params != undefined) {
            query.limit(parseInt(params.last));
        }

        // Find para encontrar datos
        query.sort('-_id').exec((err, articles) => {
            if (err) {
                return res.status(500).send({
                    status: false,
                    message: 'Error al devolver los articulos!!!'
                });
            }

            if (!articles) {
                return res.status(404).send({
                    status: false,
                    message: 'No hay articulos para mostrar!!!'
                });
            }

            return res.status(200).send({
                status: true,
                articles
            });
        });

    },
    getArticle: (req, res) => {
        // Recoger el id de la URL
        var articleId = req.params.id;

        //Comprobar que existe
        if (!articleId || articleId == null) {
            return res.status(404).send({
                status: false,
                message: 'No existe el articulo'
            });
        }
        // Buscar el articulo
        Article.findById(articleId, (err, article) => {

            if (err || !article) {
                return res.status(404).send({
                    status: false,
                    message: 'No existe el articulo!!'
                });
            }
            //Devolver en json
            return res.status(200).send({
                status: true,
                article
            });
        });

    },
    update: (req, res) => {
        // Recoger el id del articulo por la url
        var articleId = req.params.id;

        // Recoger los datos que llegan por put
        var params = req.body;

        // Validar datos
        try {
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
        } catch (err) {
            return res.status(200).send({
                status: false,
                message: 'Faltan datos por enviar !!!'
            });
        }

        if (validate_title && validate_content) {
            // Find and update
            Article.findOneAndUpdate({ _id: articleId }, params, { new: true }, (err, articleUpdate) => {
                if (err) {
                    return res.status(500).send({
                        status: false,
                        message: 'Error al actualizar !!!'
                    });
                }

                if (!articleUpdate) {
                    return res.status(404).send({
                        status: false,
                        message: 'No existe el articulo !!!'
                    });
                }

                return res.status(200).send({
                    status: true,
                    article: articleUpdate
                });

            });
        } else {
            // Devolver respuesta
            return res.status(200).send({
                status: false,
                message: 'La validacion no es correcta !!!'
            });
        }


    },
    delete: (req, res) => {
        // Recoger el id de la url
        var articleId = req.params.id;

        // Find and delete
        Article.findOneAndDelete({ _id: articleId }, (err, articleRemove) => {
            if (err) {
                return res.status(500).send({
                    status: false,
                    message: 'Error al borrar'
                });
            }
            if (!articleRemove) {
                return res.status(404).send({
                    status: false,
                    message: 'No se ha borrdo el articulo, posiblemente no exista'
                });
            }

            return res.status(200).send({
                status: true,
                article: articleRemove
            });
        })
    },
    upload: (req, res) => {
        // Configurar el modulo connect multiparty router/articles.js

        // Recoger el fichero de la peticion
        var file_name = 'Imagen no subida';

        if (!req.files) {
            return res.status(404).send({
                status: false,
                message: file_name
            })
        }
        // Conseguir el nombre y la extencion del archivo
        var file_path = req.files.file0.path;
        var file_split = file_path.split('\\');

        // * ADVERTENCIA *
        // SOLO EN LINUX O MAC: var file_split = file_path.split('/'); 

        // Nombre del archivo
        var file_name = file_split[2];

        // Extencion del fichero
        var extension_split = file_name.split('\.');
        var file_ext = extension_split[1];

        // Comprobar la extencion, solo imagenes, si no es vaalida - borrar el fichero
        if (file_ext != 'png' && file_ext != 'jpg' && file_ext != 'gif' && file_ext != 'jpeg') {
            // Borrar el archivo subido
            fs.unlink(file_path, (err) => {
                return res.status(200).send({
                    status: false,
                    message: 'La extension de la imgen no es valida !!!'
                });
            });
        } else {
            // Si todo es valido
            var articleId = req.params.id;
            if (articleId) {
                // Buscar el articulo, asignarle el nombre de la imagen y actualizarlo
                Article.findOneAndUpdate({ _id: articleId }, { image: file_name }, { new: true }, (err, articleUpdted) => {
                    if (err || !articleUpdted) {
                        return res.status(200).send({
                            status: false,
                            message: 'Error al guardar la imagen del articulo'
                        });
                    }
                    return res.status(200).send({
                        status: true,
                        article: articleUpdted
                    });
                });
            } else {
                return res.status(200).send({
                    status: true,
                    image: file_name
                });
            }

        }
    },
    getImage: (req, res) => {
        var file = req.params.image;
        var path_file = './uploads/articles/' + file;

        if (fs.existsSync(path_file)) {
            return res.sendFile(path.resolve(path_file));
        } else {
            return res.status(404).send({
                status: false,
                mesagge: 'No existe image con este nombre'
            });
        }

    },
    search: (req, res) => {
        // Sacar el string a buscar
        var searchString = req.params.search;
        // Find or
        Article.find({
            "$or": [
                { 'title': { "$regex": searchString, "$options": "i" } },
                { "content": { "$regex": searchString, "$options": "i" } }]
        })
            .sort([['date', 'descending']])
            .exec((err, articles) => {
                if (err) {
                    return res.status(500).send({
                        status: false,
                        mesagge: 'Error en la peticion'
                    });
                }
                if (!articles || articles.length <= 0) {
                    return res.status(404).send({
                        status: false,
                        mesagge: 'No hay articulos que coinsidan a la busqueda'
                    });
                }
                return res.status(200).send({
                    status: true,
                    articles: articles
                });
            });

    }
}; // end Controller

module.exports = controller;