var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var KEY = require('../config/config').KEY;

// Inicializar Variables
var app = express();

// Schema usuarios
var Usuario = require('../models/usuario');

app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usr) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al iniciar sesion',
                errors: err
            });
        }

        if (!usr) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No se encontro un usuario - email',
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, usr.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No se encontro un usuario - password',
                errors: err
            });
        }

        // crear token usuario
        usr.password = '';
        var token = jwt.sign({ usuario: usr }, KEY, { expiresIn: 14400 }); // 4 horas


        return res.status(200).json({
            ok: true,
            usuario: usr,
            id: usr.id,
            token: token
        });

    });
});


module.exports = app;