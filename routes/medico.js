var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

// Inicializar Variables
var app = express();

// Schema usuarios
var Medico = require('../models/medico');

// ========================================
//  Obtiener todos los medicos
// ========================================
app.get('/', (req, res) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .skip(desde)
        .limit(5)
        .exec(
            (err, medico) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al cargar los medicos',
                        errors: err
                    });
                }

                Medico.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        medico: medico,
                        total: conteo
                    });
                });
            });
});

// ========================================
//  Crear un nuevo Medico
// ========================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, mediGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear el medico',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medico: mediGuardado
        });

    });
});

// ========================================
//  Actualizar un Medico
// ========================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medi) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el medico',
                errors: err
            });
        }

        if (!medi) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico no existe',
                errors: { message: 'El medico no existe' }
            });
        }

        medi.nombre = body.nombre;
        medi.img = body.img;
        medi.usuario = req.usuario._id;
        medi.hospital = body.hospital;

        medi.save((err, mediGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el medico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: mediGuardado
            });

        });
    });
});

// ========================================
//  Borrar un Medico
// ========================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, mediBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el medico',
                errors: err
            });
        }

        if (!mediBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico no existe',
                errors: { message: 'El medico no existe' }
            });
        }

        return res.status(200).json({
            ok: true,
            medico: mediBorrado
        });

    });

});


module.exports = app;