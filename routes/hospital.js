var express = require('express');

// middleware for the token.
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();
var Hospital = require('../models/hospital');


// Rutas
// Get Hospitals
app.get('/', (req, res, next) => {
  var desde = req.query.desde || 0;
  desde = Number(desde);

  Hospital.find({})
  .skip(desde)
  .limit(5)
  .populate('usuario', 'nombre email')
  .exec(
    (err, hospitales) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al cargar hospitales',
          errors: err
        })
      }
      Hospital.count({}, (err, cont) => {
        res.status(200).json({
          ok: true,
          hospitales: hospitales,
          total: cont
        });

      });
    }
  );
});

// Put Hospital
app.put('/:id', mdAutenticacion.verifcaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;
  Hospital.findById(id, (err, hospital)=> {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar hospital'
      });
    }
    if (!hospital) {
      return res.status(400).json({
        ok: false,
        mensaje: `El hospital con el id ${id} no existe`,
        error: { message: 'No existe un hospital con ese ID'}
      });
    }

    hospital.nombre = body.nombre;
    hospital.usuario = req.usuario._id;

    hospital.save((err, hospitalGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar hospital',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        hospital: hospitalGuardado,
        usuarioToken: req.usuario
      })
    });


  });
});

// Delete Hospital
app.delete('/:id', mdAutenticacion.verifcaToken, (req, res) => {
  var id = req.params.id;
  Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al borrar un hospital',
        errors: err
      });
    }
    if (!hospitalBorrado) {
      return res.status(500).json({
        ok: false,
        mensaje: 'No existe el hospital con ese id',
        errors: {message: 'No existe ningun hospital con ese ID'}
      });
    }

    res.status(200).json({
      ok: true,
      hospital: hospitalBorrado,
      usuarioToken: req.usuario
    });
  });
});

// Post Hospital
app.post('/',mdAutenticacion.verifcaToken, (req, res) => {
  var body = req.body;
  var hospital = new Hospital({
    nombre: body.nombre,
    usuario: req.usuario._id
  });

  hospital.save( (err, hospitalGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al crear hospital',
        errors: err
      });
    }
    res.status(201).json({
      ok: true,
      hospital: hospitalGuardado
    });
  });

});

module.exports = app;