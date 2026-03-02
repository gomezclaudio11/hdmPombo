const mongoose = require('mongoose');

// El nombre de las propiedades debe coincidir con los encabezados de CSV/JSON
const ObservacionSchema = new mongoose.Schema({
    // --- CAMPOS NUEVOS (App React) ---
    fecha: { type: Date, default: Date.now },
    observador: String,
    sector: String,
    turno: String,
    profesional: String,
    momento: String,
    accion: String,

    // --- CAMPOS VIEJOS (Google Forms / CSV) ---
    // Los mantenemos exactamente igual para que los datos históricos sigan ahí
    'Marca temporal': Date,
    'Nombre del observador': String,
    'Sector en el que realizo la observación': String,
    'Turno': String,
    'Personal al que observo': String,
    'Momento que observa': String,
    'Accion que realizo': String,
    'Momento que observa2': String,
    'Acción que realizo2': String 
}, {
    timestamps: true //// Esto agrega 'createdAt' y 'updatedAt' automáticamente
});

module.exports = mongoose.model('Observacion', ObservacionSchema, 'observacions')
