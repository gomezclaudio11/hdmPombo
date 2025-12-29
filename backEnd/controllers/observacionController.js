const Observacion = require("../models/Observacion")

// Endpoint 1: Obtener el resumen del cumplimiento global
exports.getGlobalCompliance = async (req, res) => {
    try {
      const stats = await Observacion.aggregate([
            {
                $facet: {
                    // Calculamos el total de oportunidades (Momento 1 + Momento 2 si existe)
                    "totalOportunidades": [
                        {
                            $project: {
                                counts: {
                                    $sum: [
                                        { $cond: [{ $ifNull: ["$Momento que observa", false] }, 1, 0] },
                                        { $cond: [{ $ifNull: ["$Momento que observa2", false] }, 1, 0] }
                                    ]
                                }
                            }
                        },
                        { $group: { _id: null, total: { $sum: "$counts" } } }
                    ],
                    // Calculamos el total de acciones efectivas (Accion 1 + Accion 2)
                    "totalCumplimientos": [
                        {
                            $project: {
                                cumplimientos: {
                                    $sum: [
                                        { 
                                            $cond: [
                                                { $and: [
                                                    { $ne: ["$Accion que realizo", "Ninguna"] },
                                                    { $ne: ["$Accion que realizo", null] }
                                                ]}, 1, 0 
                                            ] 
                                        },
                                        { 
                                            $cond: [
                                                { $and: [
                                                    { $ne: ["$Acción que realizo2", "Ninguna"] },
                                                    { $ne: ["$Acción que realizo2", null] }
                                                ]}, 1, 0 
                                            ] 
                                        }
                                    ]
                                }
                            }
                        },
                        { $group: { _id: null, total: { $sum: "$cumplimientos" } } }
                    ]
                }
            }
        ]);
        const totalOportunidades = stats[0].totalOportunidades[0]?.total || 0;
        const totalCumplimiento = stats[0].totalCumplimientos[0]?.total || 0;
        
        const porcentajeCumplimiento = totalOportunidades > 0 
            ? ((totalCumplimiento / totalOportunidades) * 100).toFixed(2) 
            : 0;

        res.json({
            totalObservaciones: totalOportunidades,
            accionesRealizadas: totalCumplimiento,
            porcentajeCumplimiento: parseFloat(porcentajeCumplimiento)
        });

    } catch (error) {
        console.error('Error al obtener el cumplimiento global:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

/**
 $facet

Esta técnica nos permite ejecutar dos análisis diferentes (contar oportunidades
y contar cumplimientos) sobre la misma colección de datos en una sola pasada. 
Es mucho más rápido y eficiente
 */

// Endpoint: Obtener estadísticas de cumplimiento agrupadas por sector
exports.getComplianceBySector = async (req, res) => {
    try {
        const statsBySector = await Observacion.aggregate([
            {
            $project: {
                    sector: "$Sector en el que realizo la observación",
                    // Calculamos cuántas oportunidades hubo en esta fila (1 o 2)
                    oportunidadesEnFila: {
                        $sum: [
                            { $cond: [{ $ifNull: ["$Momento que observa", false] }, 1, 0] },
                            { $cond: [{ $ifNull: ["$Momento que observa2", false] }, 1, 0] }
                        ]
                    },
                    // Calculamos cuántos cumplimientos hubo en esta fila (0, 1 o 2)
                    cumplimientosEnFila: {
                        $sum: [
                            { 
                                $cond: [
                                    { $and: [
                                        { $ne: ["$Accion que realizo", "Ninguna"] },
                                        { $ne: ["$Accion que realizo", null] }
                                    ]}, 1, 0 
                                ] 
                            },
                            { 
                                $cond: [
                                    { $and: [
                                        { $ne: ["$Acción que realizo2", "Ninguna"] },
                                        { $ne: ["$Acción que realizo2", null] }
                                    ]}, 1, 0 
                                ] 
                            }
                        ]
                    }
                }
            },
            {
                // Ahora agrupamos por sector sumando los totales calculados arriba
                $group: {
                    _id: "$sector",
                    totalOportunidades: { $sum: "$oportunidadesEnFila" },
                    totalCumplimientos: { $sum: "$cumplimientosEnFila" }
                }
            },
            {
                $project: {
                    sector: "$_id",
                    totalOportunidades: 1,
                    totalCumplimientos: 1,
                    porcentajeCumplimiento: {
                        $multiply: [
                            { 
                                $cond: [
                                    { $eq: ["$totalOportunidades", 0] }, 
                                    0, 
                                    { $divide: ["$totalCumplimientos", "$totalOportunidades"] }
                                ] 
                            },
                            100
                        ]
                    }
                }
            },
            { $sort: { porcentajeCumplimiento: -1 } }
        ]);

        res.json(statsBySector);    
    } catch (error) {
        console.error('Error al obtener datos por sector:', error);
        res.status(500).json({ message: 'Error al procesar sectores', error: error.message });
    }
};



// Endpoint: Obtener estadísticas de cumplimiento agrupadas por Rol Profesional
exports.getComplianceByProfessional = async (req, res) => {
    try {
        const statsByProfessional = await Observacion.aggregate([
            {
                // Primera fase: Agrupamos por el rol del personal observado
                $group: {
                    _id: "$Personal al que observo", 
                    totalObservaciones: { $sum: 1 },
                    accionesCorrectas: {
                        $sum: {
                            $cond: [
                                { 
                                    $and: [
                                        { $ne: ["$Accion que realizo", "Ninguna"] }, 
                                        { $ne: ["$Accion que realizo", null] }
                                    ]
                                }, 
                                1, 0
                            ]
                        }
                    }
                }
            },
            {
                // Segunda fase: Calculamos el porcentaje y limpiamos la salida
                $project: {
                    rol: "$_id",
                    totalObservaciones: 1,
                    accionesCorrectas: 1,
                    porcentajeCumplimiento: {
                        $multiply: [
                            { 
                                $cond: [
                                    { $eq: ["$totalObservaciones", 0] }, 
                                    0, 
                                    { $divide: ["$accionesCorrectas", "$totalObservaciones"] }
                                ]
                            },
                            100
                        ]
                    }
                }
            },
            // Ordenar de mayor a menor cumplimiento para el ranking del Dashboard
            { $sort: { porcentajeCumplimiento: -1 } }
        ]);

        res.json(statsByProfessional);
    } catch (error) {
        console.error('Error al obtener datos por profesional:', error);
        res.status(500).json({ message: 'Error al procesar roles profesionales', error: error.message });
    }
};

// Endpoint: Obtener cumplimiento según el Momento de la observación
exports.getComplianceByMoment = async (req, res) => {
    try {
        const statsByMoment = await Observacion.aggregate([
             {
                // 1. Proyectamos las dos posibles oportunidades de la fila por separado
                $project: {
                    oportunidades: [
                        {
                            momento: "$Momento que observa",
                            cumplio: {
                                $cond: [
                                    { $and: [
                                        { $ne: ["$Accion que realizo", "Ninguna"] },
                                        { $ne: ["$Accion que realizo", null] },
                                        { $ne: ["$Momento que observa", null] }
                                    ]}, 1, 0
                                ]
                            },
                            existe: { $cond: [{ $ifNull: ["$Momento que observa", false] }, 1, 0] }
                        },
                        {
                            momento: "$Momento que observa2",
                            cumplio: {
                                $cond: [
                                    { $and: [
                                        { $ne: ["$Acción que realizo2", "Ninguna"] },
                                        { $ne: ["$Acción que realizo2", null] },
                                        { $ne: ["$Momento que observa2", null] }
                                    ]}, 1, 0
                                ]
                            },
                            existe: { $cond: [{ $ifNull: ["$Momento que observa2", false] }, 1, 0] }
                        }
                    ]
                }
            },
            { $unwind: "$oportunidades" }, // 2. Convertimos el array en documentos individuales
            { $match: { "oportunidades.existe": 1 } }, // 3. Filtramos solo donde realmente hubo un momento registrado
            {
                // 4. Agrupamos por el nombre del momento
                $group: {
                    _id: "$oportunidades.momento",
                    totalOportunidades: { $sum: 1 },
                    totalCumplimientos: { $sum: "$oportunidades.cumplio" }
                }
            },
            {
                // 5. Calculamos el porcentaje final
                $project: {
                    momento: "$_id",
                    totalOportunidades: 1,
                    totalCumplimientos: 1,
                    porcentajeCumplimiento: {
                        $multiply: [
                            { $divide: ["$totalCumplimientos", "$totalOportunidades"] },
                            100
                        ]
                    }
                }
            },
            { $sort: { momento: 1 } } // Ordenamos por nombre de momento              
        ]);

        res.json(statsByMoment);
    } catch (error) {
        console.error('Error al obtener datos por momento:', error);
        res.status(500).json({ message: 'Error al procesar momentos', error: error.message });
    }
};

// Endpoint: Obtener el uso de las diferentes técnicas de higiene
exports.getTechniqueUsage = async (req, res) => {
    try {
        const statsByTechnique = await Observacion.aggregate([
            {
               $facet: {
                    // Conteo de la primera columna de técnicas
                    "tecnica1": [
                        { $match: { "Accion que realizo": { $nin: [null, "Ninguna", ""] } } },
                        { $group: { _id: "$Accion que realizo", cantidad: { $sum: 1 } } }
                    ],
                    // Conteo de la segunda columna de técnicas
                    "tecnica2": [
                        { $match: { "Acción que realizo2": { $nin: [null, "Ninguna", ""] } } },
                        { $group: { _id: "$Acción que realizo2", cantidad: { $sum: 1 } } }
                    ]
                }
            },
            {
                // Unimos ambos resultados en un solo array
                $project: {
                    combined: { $concatArrays: ["$tecnica1", "$tecnica2"] }
                }
            },
            { $unwind: "$combined" },
            {
                // Agrupamos nuevamente para sumar las cantidades de ambas columnas
                $group: {
                    _id: "$combined._id",
                    total: { $sum: "$combined.cantidad" }
                }
            },
            {
                $project: {
                    tecnica: "$_id",
                    cantidad: "$total",
                    _id: 0
                }
            },
            { $sort: { cantidad: -1 } }
        ]);

        res.json(statsByTechnique);
    } catch (error) {
        console.error('Error al obtener técnicas:', error);
        res.status(500).json({ message: 'Error al procesar técnicas', error: error.message });
    }
};

// Endpoint: Obtener cumplimiento agrupado por Turno
exports.getComplianceByShift = async (req, res) => {
    try {
        const statsByShift = await Observacion.aggregate([
            {
               $project: {
                    turno: "$Turno",
                    // 1. Calculamos oportunidades totales en la fila (Momento 1 + Momento 2)
                    oportunidadesEnFila: {
                        $sum: [
                            { $cond: [{ $ifNull: ["$Momento que observa", false] }, 1, 0] },
                            { $cond: [{ $ifNull: ["$Momento que observa2", false] }, 1, 0] }
                        ]
                    },
                    // 2. Calculamos cumplimientos totales en la fila (Accion 1 + Acción 2)
                    cumplimientosEnFila: {
                        $sum: [
                            { 
                                $cond: [
                                    { $and: [
                                        { $ne: ["$Accion que realizo", "Ninguna"] },
                                        { $ne: ["$Accion que realizo", null] }
                                    ]}, 1, 0 
                                ] 
                            },
                            { 
                                $cond: [
                                    { $and: [
                                        { $ne: ["$Acción que realizo2", "Ninguna"] },
                                        { $ne: ["$Acción que realizo2", null] }
                                    ]}, 1, 0 
                                ] 
                            }
                        ]
                    }
                }
            },
            {
                // 3. Limpiamos registros sin turno antes de agrupar
                $match: { "turno": { $ne: null, $ne: "" } }
            },
            {
                // 4. Agrupamos por Turno sumando los totales
                $group: {
                    _id: "$turno",
                    totalOportunidades: { $sum: "$oportunidadesEnFila" },
                    totalCumplimientos: { $sum: "$cumplimientosEnFila" }
                }
            },
            {
                // 5. Calculamos el porcentaje final
                $project: {
                    turno: "$_id",
                    totalOportunidades: 1,
                    totalCumplimientos: 1,
                    porcentajeCumplimiento: {
                        $multiply: [
                            { 
                                $cond: [
                                    { $eq: ["$totalOportunidades", 0] }, 
                                    0, 
                                    { $divide: ["$totalCumplimientos", "$totalOportunidades"] }
                                ] 
                            },
                            100
                        ]
                    }
                }
            },
            { $sort: { porcentajeCumplimiento: -1 } }
        ]);

        res.json(statsByShift);
    } catch (error) {
        console.error('Error al obtener datos por turno:', error);
        res.status(500).json({ message: 'Error al procesar los turnos', error: error.message });
    }
};

//Endpoint dinamico
exports.getStaffComplianceBySector = async (req, res) => {
    try {
        // Capturamos el nombre desde la URL
        const { nombreSector } = req.params; 

        const stats = await Observacion.aggregate([
            {
               // 1. Filtramos primero por el sector solicitado (Eficiencia)
                $match: { 
                    "Sector en el que realizo la observación": nombreSector 
                }
            },
            {
                // 2. Proyectamos las dos oportunidades de la fila
                $project: {
                    personal: "$Personal al que observo",
                    oportunidadesEnFila: {
                        $sum: [
                            { $cond: [{ $ifNull: ["$Momento que observa", false] }, 1, 0] },
                            { $cond: [{ $ifNull: ["$Momento que observa2", false] }, 1, 0] }
                        ]
                    },
                    cumplimientosEnFila: {
                        $sum: [
                            { 
                                $cond: [
                                    { $and: [
                                        { $ne: ["$Accion que realizo", "Ninguna"] },
                                        { $ne: ["$Accion que realizo", null] }
                                    ]}, 1, 0 
                                ] 
                            },
                            { 
                                $cond: [
                                    { $and: [
                                        { $ne: ["$Acción que realizo2", "Ninguna"] },
                                        { $ne: ["$Acción que realizo2", null] }
                                    ]}, 1, 0 
                                ] 
                            }
                        ]
                    }
                }
            },
            {
                // 3. Agrupamos por el Personal observado dentro de ese sector
                $group: {
                    _id: "$personal",
                    totalOportunidades: { $sum: "$oportunidadesEnFila" },
                    totalCumplimientos: { $sum: "$cumplimientosEnFila" }
                }
            },
            {
                // 4. Calculamos el porcentaje final por persona
                $project: {
                    personal: "$_id",
                    totalOportunidades: 1,
                    totalCumplimientos: 1,
                    porcentajeCumplimiento: {
                        $multiply: [
                            { 
                                $cond: [
                                    { $eq: ["$totalOportunidades", 0] }, 
                                    0, 
                                    { $divide: ["$totalCumplimientos", "$totalOportunidades"] }
                                ] 
                            },
                            100
                        ]
                    }
                }
            },
            { $sort: { porcentajeCumplimiento: -1 } }
        ]);

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Error al procesar datos del sector' });
    }
};