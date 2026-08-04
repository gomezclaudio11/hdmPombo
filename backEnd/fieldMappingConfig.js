// Configuration for MongoDB fields mapping during data unification
const fieldMappingConfig = {
  legacyFields: {
    observador: ['Nombre del observador', 'observador'],
    fecha: ['Marca temporal', 'fecha'],
    sector: ['Sector en el que realizo la observación', 'sector'],
    profesional: ['Personal al que observo', 'profesional'],
    momento: ['Momento que observa', 'momento'],
    turno: ['Turno', 'turno'],
    accion: ['Accion que realizo', 'accion']
  },
  actionValues: {
    invalidActions: [null, "", "null", "Ninguna"],
    validAction: "Ninguna"
  }
};

module.exports = fieldMappingConfig;