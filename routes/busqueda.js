var express = require('express');
var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// Rutas

// Busqueda por colleccion
app.get('/coleccion/:tabla/:busqueda', (req, res) => {
  var busqueda = req.params.busqueda;
  var regex = new RegExp(busqueda, 'i');
  var tabla = req.params.tabla;
  var promesa;
  if (tabla === 'medicos') {
    promesa = buscarMedicos(busqueda, regex);

  } else if(tabla === 'hospitales') {
    promesa = buscarHospitales(busqueda, regex);

  } else if( tabla === 'usuarios'){
    promesa = buscarUsuario(busqueda, regex);

  } else {
    res.status(400).json({
      ok: false,
      mensaje: 'Los tipos de busqueda solo son usuarios, medicos y hospitales',
      error:{message: 'Tipo de tabla/coleccion no valido'}
    });
  }

  promesa.then( data => {
    res.status(200).json({
      ok: true,
      [tabla]: data
    });
  });

});

// Busqueda general
app.get('/todo/:busqueda', (req, res, next) => {
  var busqueda = req.params.busqueda;
  var regex = new RegExp(busqueda, 'i');

  Promise.all([
    buscarHospitales(busqueda, regex),
    buscarMedicos(busqueda, regex),
    buscarUsuario(busqueda, regex)
  ]).then( respuestas => {
    res.status(200).json({
      ok: true,
      hospitales: respuestas[0],
      medicos: respuestas[1],
      usuarios: respuestas[2]
    })
  });

});

function buscarHospitales(busqueda, regex) {
  return new Promise( (resolve, reject) => {
    Hospital.find({nombre: regex})
      .populate('usuario', 'nombre email')
      .exec((err, hospitales) => {
        if (err) {
          reject('Error al cargar hospitales', err);
        } else {
          resolve(hospitales);
        }
      });
  })
}

function buscarMedicos(busqueda, regex) {
  return new Promise( (resolve, reject) => {
    Medico.find({nombre: regex})
    .populate('usuario', 'nombre email')
    .populate('hospital')
    .exec(
      (err, medicos) => {
        if (err) {
          reject('Error al cargar medicos', err);
        } else {
          resolve(medicos);
        }
    });
  })
}

function buscarUsuario(busqueda, regex) {
  return new Promise( (resolve, reject) => {
    Usuario.find({}, 'nombre email role')
      .or([ {'nombre': regex}, {'email': regex}])
      .exec((err, usuarios) => {
        if (err) {
          reject('Error al cargar usaurios', err);
        } else {
          resolve(usuarios)
        }
      });
  })
}


module.exports = app;
