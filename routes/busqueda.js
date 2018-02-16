var express = require('express');

// Inicializar Variables
var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// ========================================
//  Busqueda Por Collecion (Tabla)
// ========================================
app.get('/coleccion/:tabla/:busqueda', (req, res) => {

    var coleccion = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    var promesa;

    switch (coleccion) {
        case 'medico':
            promesa = buscarMedicos(busqueda, regex);
            break;
        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regex);
            break;
        case 'hospitales':
            promesa = buscarHospitales(busqueda, regex);
            break;

        default:
            return res.status(404).json({
                ok: false,
                mensaje: 'No existe al tipo de busqueda'
            });
    }

    Promise.all([
            promesa
        ])
        .then(data => {
            res.status(200).json({
                ok: true,
                [coleccion]: data
            });
        });
});

// ========================================
//  Busqueda General
// ========================================
app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    Promise.all([
            buscarHospitales(busqueda, regex),
            buscarMedicos(busqueda, regex),
            buscarUsuarios(busqueda, regex)
        ])
        .then(data => {
            res.status(200).json({
                ok: true,
                hospitales: data[0],
                medicos: data[1],
                usuarios: data[2]
            });
        });
});



function buscarHospitales(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {

                if (err) {
                    reject('Error al cargar hospitales', err);
                } else {
                    resolve(hospitales);
                }

            });
    });
}

function buscarMedicos(busqueda, regex) {
    return new Promise((resolve, reject) => {

        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {
                if (err) {
                    reject('Error al cargar medicos', err);
                } else {
                    resolve(medicos);
                }
            });
    });
}

function buscarUsuarios(busqueda, regex) {
    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email role')
            .or([{ nombre: regex }, { email: regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject();
                } else {
                    resolve(usuarios);
                }
            })
    });
}

module.exports = app;