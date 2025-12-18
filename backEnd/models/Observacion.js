const mongoose = require('mongoose');

// El nombre de las propiedades debe coincidir con los encabezados de tu CSV/JSON
const ObservacionSchema = new mongoose.Schema({
    'Marca temporal': Date,
    'Nombre del observador': String,
    'Sector en el que realizo la observación': String,
    'Turno': String,
    'Personal al que observo': String,
    'Momento que observa': String,
    'Accion que realizo': String,
    'Momento que observa 2': String,
    'Acción que realizo 2': String 
});

module.exports = mongoose.model('Observacion', ObservacionSchema, 'observacions')