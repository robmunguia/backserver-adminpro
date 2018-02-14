var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');


var mdAutenticacion = require('../middlewares/autenticacion');


// Inicializar Variables
var app = express();

// Schema usuarios
var Usuario = require('../models/usuario');


// ========================================
//  Obtiener todos los usuarios
// ========================================
app.get('/', (req, res, next) => {


    Usuario.find({}, 'nombre email img role')
        .exec(
            (err, usr) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al cargar los usuarios',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    users: usr
                });

            });
});


// ========================================
//  Crear un nuevo usuario
// ========================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usrSave) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuarios',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            data: usrSave,
            usrToken: req.usuario
        });

    });
});

// ========================================
//  Actualizar un usuario
// ========================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usr) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usr) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario no existe',
                errors: { message: 'El usuario no existe' }
            });
        }

        usr.nombre = body.nombre;
        usr.email = body.email;
        usr.role = body.role;

        usr.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = '';

            res.status(200).json({
                ok: true,
                data: usuarioGuardado
            });

        });
    });
});

// ========================================
//  Borrar un usuario
// ========================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario no existe',
                errors: { message: 'El usuario no existe' }
            });
        }

        return res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });

    });

});


module.exports = app;