const mongoose = require('mongoose');

// El nombre de las propiedades debe coincidir con los encabezados de CSV/JSON
const ObservacionSchema = new mongoose.Schema({
    // --- CAMPOS NUEVOS (App React) ---
    fecha: { 
        type: Date, 
        default: Date.now,
        require: [true, "La fecha es obligatoria"]
    },
    observador: {
        type: String,
        require: [true, "El nombre del observador es obligatorio"],
        trim: true //limpia espacios en blancos accidentales
    },
    sector: {
        type: String,
        require: [ true, "El sector es obligatorio" ],
        enum: {
            values: ['7mo piso', '6to piso', '5to piso', '4to piso', 'UTI ADULTO', 'GUARDIA'],
            message: "{VALUE} no es un sector valido"
        }
    },
    turno: {
        type: String,
        require: [true, "El turno es obligatorio"],
        enum: ['Mañana', 'Tarde', 'Noche A', 'Noche B', 'SADOFE', 'SADOFE NOCHE']
    },
    profesional: {
        type: String,
        require:[true, "El rol profesional es obligatorio"],
        trim: true
    },
    momento: {
        type: String,
        require: [true, "El momento de observacion es obligatorio"],
        enum: [
            'Antes de tocar al paciente',
            'Antes de realizar técnica Aseptica',
            'Despues de tocar fluidos',
            'Despues de tocar al paciente',
            'Despues de tocar entorno'
        ]
    },
    accion: {
        type: String,
        require: [true, "La ccion realizada es obligatoria"],
        enum: [
            'Higiene con solución alcoholica',
            'Ninguna',
            'Agua y Jabón (solo en Guardia)'
        ]
    },

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

// ÍNDICES ESTRATÉGICOS:
// Acelera los filtros por fecha y sector (los más usados en el Dashboard)
ObservacionSchema.index({ fecha: -1, sector: 1 });

// Acelera los rankings de profesionales
ObservacionSchema.index({ profesional: 1 });

module.exports = mongoose.model('Observacion', ObservacionSchema, 'observacions')
