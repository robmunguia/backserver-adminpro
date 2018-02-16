var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');


// Inicializar Variables
var app = express();
// default options
app.use(fileUpload());


var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

app.get('/', (req, res, next) => {

    res.status(200).json({
        ok: true,
        mensaje: 'Peticion realizada correctamente'
    });

});

app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // Tipos de colecciones
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        res.status(400).json({
            ok: false,
            mensaje: 'No se ha encontrado la colección',
            errors: { mensaje: 'No se ha encontrado la colección' }
        });
    }

    if (!req.files) {
        res.status(400).json({
            ok: false,
            mensaje: 'No se ha encontrado el archivo',
            errors: { mensaje: 'No se ha seleccionado el archivo' }
        });
    }

    // Obtener el nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var ext = nombreCortado[nombreCortado.length - 1];

    // Arreglo de validaciones de extensiones permitidas
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
    if (extensionesValidas.indexOf(ext) < 0) {
        res.status(400).json({
            ok: false,
            mensaje: 'La extension del archivo no es permitido',
            errors: { mensaje: 'Las extensiones válidas son ' + extensionesValidas.join(', ') }
        });
    }

    // Nombre Archivo Personalizado
    // formato nombre archivo IdUsuario-NumeroRandom.extension
    var nuevoNombreArch = `${ id }-${ new Date().getMilliseconds() }.${ext}`;

    // Guardar el archivo en folder
    var path = `./uploads/${ tipo }/${ nuevoNombreArch }`;

    archivo.mv(path, err => {
        if (err) {
            res.status(500).json({
                ok: false,
                mensaje: 'Ocurrio un error al guardar el archivo',
                path: path,
                errors: { mensaje: err }
            });
        }
    });

    subirPorTipo(tipo, id, nuevoNombreArch, res);

    // res.status(201).json({
    //     ok: false,
    //     mensaje: 'Archivo Guardado'
    // });

});



function subirPorTipo(tipo, id, nombreArchivo, res) {
    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No se encontro el usuario'
                });
            }

            var pathAnterior = './uploads/usuarios/' + usuario.img;
            // Si existe elimina la imagen anterior
            if (fs.existsSync(pathAnterior)) {
                fs.unlink(pathAnterior);
            }

            // Sube la nueva imagen
            usuario.img = nombreArchivo;
            usuario.save((err, usrActualizado) => {
                if (err) {
                    res.status(500).json({
                        ok: false,
                        mensaje: 'Ocurrio un error al guardar el archivo',
                        path: path,
                        errors: { mensaje: err }
                    });
                }

                usrActualizado.password = '';
                return res.status(201).json({
                    ok: false,
                    usuario: usrActualizado,
                    mensaje: 'Imagen de Usuario Actualizado'
                });

            });
        });
    }

    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {

            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No se encontro el medico'
                });
            }

            var pathAnterior = './uploads/medicos/' + medico.img;
            // Si existe elimina la imagen anterior
            if (fs.existsSync(pathAnterior)) {
                fs.unlink(pathAnterior);
            }

            // Sube la nueva imagen
            medico.img = nombreArchivo;
            medico.save((err, mediActualizado) => {
                if (err) {
                    res.status(500).json({
                        ok: false,
                        mensaje: 'Ocurrio un error al guardar el archivo',
                        path: path,
                        errors: { mensaje: err }
                    });
                }

                return res.status(201).json({
                    ok: false,
                    medico: mediActualizado,
                    mensaje: 'Imagen del medico actualizado'
                });

            });
        });
    }

    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {

            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No se encontro el hospital'
                });
            }

            var pathAnterior = './uploads/medicos/' + hospital.img;
            // Si existe elimina la imagen anterior
            if (fs.existsSync(pathAnterior)) {
                fs.unlink(pathAnterior);
            }

            // Sube la nueva imagen
            hospital.img = nombreArchivo;
            hospital.save((err, hospiActualizado) => {
                if (err) {
                    res.status(500).json({
                        ok: false,
                        mensaje: 'Ocurrio un error al guardar el archivo',
                        path: path,
                        errors: { mensaje: err }
                    });
                }

                return res.status(201).json({
                    ok: false,
                    hospital: hospiActualizado,
                    mensaje: 'Imagen del medico actualizado'
                });

            });
        });
    }

}


module.exports = app;