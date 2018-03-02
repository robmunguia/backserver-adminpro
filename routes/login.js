var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var KEY = require('../config/config').KEY;
var GoogleClient_Id = require('../config/config').GOOGLE_CLIENT_ID;
var GoogleSecret = require('../config/config').GOOGLE_SECRET;

// Librerias Google SingIn
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(GoogleClient_Id);

// Inicializar Variables
var app = express();

// Schema usuarios
var Usuario = require('../models/usuario');

// ========================================
//  Login Google
// ========================================
app.post('/google', (req, res, next) => {
    var token = req.body.token;
    const oAuth2Client = new OAuth2Client(
        GoogleClient_Id,
        GoogleSecret
    );
    const tiket = oAuth2Client.verifyIdToken({
        idToken: token
    });
    tiket.then(data => {

        Usuario.findOne({ email: data.payload.email }, (err, usuario) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar el usuario',
                    error: err
                });
            }

            if (usuario) {
                if (!usuario.google) {

                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Este usuario no se registro mediante Google',
                        error: err
                    });

                } else {

                    // crear token usuario
                    usuario.password = '';
                    var token = jwt.sign({ usuario: usuario }, KEY, { expiresIn: 14400 }); // 4 horas

                    return res.status(200).json({
                        ok: true,
                        usuario: usuario,
                        id: usuario._id,
                        token: token
                    });

                }
                // No existe el usuario
            } else {

                var usuario = new Usuario();
                usuario.nombre = data.payload.name;
                usuario.email = data.payload.email;
                usuario.password = ':)';
                usuario.img = data.payload.picture;
                usuario.google = true;

                usuario.save((err, usrDB) => {

                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al guardar el usuario google',
                            error: err
                        });
                    }

                    // crear token usuario
                    usrDB.password = '';
                    var token = jwt.sign({ usuario: usrDB }, KEY, { expiresIn: 14400 }); // 4 horas

                    return res.status(200).json({
                        ok: true,
                        usuario: usrDB,
                        id: usrDB._id,
                        token: token
                    });

                });

            }

        });

    });
});



// ========================================
//  Login Normal
// ========================================
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