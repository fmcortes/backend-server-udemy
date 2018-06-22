var express = require('express');

// middleware for the token.
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();
var Medico = require('../models/medico');

// Rutas
// Get Medicos
app.get('/', (req, res, next) => {
  var desde = req.query.desde || 0;
  desde = Number(desde);

  Medico.find({})
  .skip(desde)
  .limit(5)
  .populate('usuario', 'nombre email')
  .populate('hospital')
  .exec(
    (err, medicos) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al cargar medicos',
          errors: err
        })
      }
      Medico.count({}, (err, cont) => {
        res.status(200).json({
          ok: true,
          medicos: medicos,
          total: cont
        });

      });
    }
  );
});
// Put Medico
app.put('/:id', mdAutenticacion.verifcaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;
  Medico.findById(id, (err, medico)=> {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar medico'
      });
    }
    if (!medico) {
      return res.status(400).json({
        ok: false,
        mensaje: `El medico con el id ${id} no existe`,
        error: { message: 'No existe un medico con ese ID'}
      });
    }

    medico.nombre = body.nombre;
    medico.usuario = req.usuario._id;
    medico.hospital = body.hospital;

    medico.save((err, medicoGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar medico',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        medico: medicoGuardado,
        usuarioToken: req.usuario
      })
    });


  });
});

// Delete Medico
app.delete('/:id', mdAutenticacion.verifcaToken, (req, res) => {
  var id = req.params.id;
  Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al borrar un medico',
        errors: err
      });
    }
    if (!medicoBorrado) {
      return res.status(500).json({
        ok: false,
        mensaje: 'No existe el medico con ese id',
        errors: {message: 'No existe ningun medico con ese ID'}
      });
    }

    res.status(200).json({
      ok: true,
      medico: medicoBorrado,
      usuarioToken: req.usuario
    });
  });
});

// Post Medico
app.post('/',mdAutenticacion.verifcaToken, (req, res) => {
  var body = req.body;
  var medico = new Medico({
    nombre: body.nombre,
    img: body.img,
    hospital: body.hospital,
    usuario: req.usuario._id
  });

  medico.save( (err, medicoGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al crear medico',
        errors: err
      });
    }
    res.status(201).json({
      ok: true,
      medico: medicoGuardado,
      usuarioToken: req.usuario
    });
  });

});

module.exports = app;