var jwt = require('jsonwebtoken');

var KEY = require('../config/config').KEY;



// ========================================
//  Verifica Token
// ========================================
exports.verificaToken = function(req, res, next) {

    var token = req.query.token;

    jwt.verify(token, KEY, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token Incorrecto',
                errors: err
            });
        }

        req.usuario = decoded.usuario;

        next();
    });

}