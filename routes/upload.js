var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');
var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// default options
app.use(fileUpload());

// Rutas
app.put('/:tipo/:id', (req, res, next) => {
  var tipo = req.params.tipo;
  var id = req.params.id;

  // tipos de colecciones
  var tiposValidos = ['medicos', 'hospitales', 'usuarios'];
  if (tiposValidos.indexOf( tipo ) < 0) {
    return res.status(400).json({
      ok: false,
      mensaje: 'Tipo de coleccion no es valida',
      errors: { message: 'Tipo de coleccion no es valida'}
    });
  }

  if(!req.files) {
    return res.status(400).json({
      ok: false,
      mensaje: "No selecciono nada",
      errors: { message: "Debe seleccionar una imagen"}
    })
  }

  // obtener nombre del archivo
  var archivo = req.files.imagen;
  var nombreCortado = archivo.name.split('.');
  var extensionArchivo = nombreCortado[nombreCortado.length -1];

  // Extensiones permitidas
  var extensionesValidas = [
    'png', 'jpg', 'gif', 'jpeg'
  ];

  if (extensionesValidas.indexOf(extensionArchivo) < 0) {
    return res.status(400).json({
      ok: false,
      mensaje: 'Extension no valida',
      errors: { message: 'Las extensiones validas son: '+ extensionesValidas.join(', ')}
    });
  }

  // Nombre de archivo personalizado
  var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;
  //Mover del archivo del temporal a un path
  var path = `./uploads/${tipo}/${ nombreArchivo}`;
  archivo.mv( path, (err) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al mover archivo',
        errors: err
      });
    }
    subirPorTipo(tipo, id, nombreArchivo, res);
    /* res.status(200).json({
      ok: true,
      mensaje: 'Archivo movido',
      nombrecortado: extensionArchivo
    }) */

  })


});

function subirPorTipo(tipo, id, nombreArchivo, res ) {
  if (tipo === 'usuarios') {
    Usuario.findById(id, (err, usuario) => {

      if (!usuario) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Usuario no existe',
          errors: {message: 'El usuario no existe'}
        });
      }

      var oldPath = './uploads/usuarios/' + usuario.img;
      if (fs.existsSync(oldPath)) {
        fs.unlink(oldPath);
      }

      usuario.img = nombreArchivo;
      usuario.save((err, usuarioActualizado) => {
        usuarioActualizado.password = ':)';
        return res.status(200).json({
          ok: true,
          mensaje: 'Imagen de usuario actualizada',
          usuario: usuarioActualizado
        });
      });

    });
  }

  if (tipo === 'medicos') {
    Medico.findById(id, (err, medico) => {

      if (!medico) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Medico no existe',
          errors: {message: 'El medico no existe'}
        });
      }

      var oldPath = './uploads/medicos/' + medico.img;
      if (fs.existsSync(oldPath)) {
        fs.unlink(oldPath);
      }

      medico.img = nombreArchivo;
      medico.save((err, medicoActualizado) => {
        return res.status(200).json({
          ok: true,
          mensaje: 'Imagen de medico actualizada',
          medico: medicoActualizado
        });
      });

    });
  }

  if (tipo === 'hospitales') {
    Hospital.findById(id, (err, hospital) => {
      if (!hospital) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Hospital no existe',
          errors: {message: 'El hospital no existe'}
        });
      }
      var oldPath = './uploads/hospitales/' + hospital.img;
      if (fs.existsSync(oldPath)) {
        fs.unlink(oldPath);
      }

      hospital.img = nombreArchivo;
      hospital.save((err, hospitalActualizado) => {
        return res.status(200).json({
          ok: true,
          mensaje: 'Imagen de hospital actualizada',
          hospital: hospitalActualizado
        });
      });

    });
  }

}

module.exports = app;
