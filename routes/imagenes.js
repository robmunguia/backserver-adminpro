var express = require('express');
var fs = require('fs');

// Inicializar Variables
var app = express();


app.get('/:tipo/:img', (req, res, next) => {

    var tipo = req.params.tipo;
    var img = req.params.img;

    var path = `./uploads/${tipo}/${img}`;

    fs.exists(path, existe => {
        if (!existe) {
            path = './assets/img/no-img.jpg';
        }

        res.sendfile(path);

    });

    // res.status(200).json({
    //     ok: true,
    //     mensaje: 'Peticion realizada correctamente'
    // });
});

module.exports = app;