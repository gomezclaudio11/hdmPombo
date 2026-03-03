const Observacion = require("../models/Observacion")

// Función para unificar datos LLAMARLA UNA VEZ
exports.unificarDatosHistoricos = async () => {
    const datosViejos = await Observacion.find({ sector: { $exists: false } });

    for (let doc of datosViejos) {
        doc.fecha = doc['Marca temporal'] || doc.createdAt;
        doc.observador = doc['Nombre del observador'];
        doc.sector = doc['Sector en el que realizo la observación'];
        doc.profesional = doc['Personal al que observo'];
        doc.momento = doc['Momento que observa'];
        doc.accion = doc['Accion que realizo'];
        
        await doc.save();
    }
    console.log(`${datosViejos.length} registros actualizados`);
};


// Endpoint 1: Obtener el resumen del cumplimiento global
exports.getGlobalCompliance = async (req, res) => {
    try {
        const { mes } = req.query; // Capturamos el mes (ej: "03", "07", "11")
        let filtroFecha = {};

       // 1. Filtro de fecha mejorado: Ahora usa el campo 'fecha' y detecta el año actual
        if (mes) {
            const anioActual = new Date().getFullYear(); // Dinámico para que sirva en 2026
            const inicio = new Date(`${anioActual}-${mes}-01T00:00:00.000Z`);
            const fin = new Date(`${anioActual}-${mes}-31T23:59:59.999Z`);
            
            // Filtramos por el nuevo campo 'fecha' (unificado)
            filtroFecha = { fecha: { $gte: inicio, $lte: fin } }; 
        }

      const stats = await Observacion.aggregate([ //pipeline de agregacion
        { $match: filtroFecha }, //filtro
        {
                $facet: { 
                    // Ahora es mucho más simple: 1 documento = 1 oportunidad
                    "totalOportunidades": [
                        { $count: "total" }
                    ],
                    "totalCumplimientos": [
                        {
                            $match: {
                                // Filtramos los que NO son 'Ninguna' y que tengan una acción
                                accion: { $exists: true, $ne: "Ninguna", $ne: null }
                            }
                        },
                        { $count: "total" }
                    ]
                }
            }
        ]);
        // Extraemos los resultados con seguridad (Optional Chaining)
        const totalOportunidades = stats[0].totalOportunidades[0]?.total || 0;
        const totalCumplimiento = stats[0].totalCumplimientos[0]?.total || 0;
        /**
         *mongo db devuelve
         [
            {
                "totalOportunidades": [{ "total": 150 }],
                "totalCumplimientos": [{ "total": 120 }]
            }
        ]
        Con stats[0] (entra a la llave) -> totalOportunidades[0] (entra al corchete) -> 
        .total (toma el 150).   
        optional chaining => El símbolo ?. significa: "Si lo que está a la izquierda existe, 
        sigue adelante; si no, detente y devuelve undefined". 
        Si toda la búsqueda anterior falló o no encontró datos (devolvió null o undefined), 
        el operador || dice: "Bueno, si no hay nada, entonces pon un 0". Esto es vital para 
        que cuando calcules el porcentaje no intentes dividir por "nada", lo que rompería tu 
        aplicación.
         */

        //operador ternario
        const porcentajeCumplimiento = totalOportunidades > 0 //para que no divida x 0
            ? ((totalCumplimiento / totalOportunidades) * 100).toFixed(2) 
            : 0;

        res.json({ //envio de respuestas
            totalObservaciones: totalOportunidades,
            accionesRealizadas: totalCumplimiento,
            porcentajeCumplimiento: parseFloat(porcentajeCumplimiento)
            // Como usamos .toFixed(2), el resultado se convirtió técnicamente en un "String" (texto).
            //  Con parseFloat, lo volvemos a convertir en un número para que los gráficos de barras
            //  puedan dibujarlo correctamente
        });

    } catch (error) {
        console.error('Error al obtener el cumplimiento global:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};
/**
 * AGGREGATE
 framework de agregación de MongoDB permite realizar procesamientos de 
 datos complejos directamente en el servidor. Esto es mucho más eficiente que traer miles 
 de documentos al Frontend y procesarlos con JavaScript, ya que reduce el tráfico de red y 
 aprovecha la potencia de cálculo de la base de datos.
 */
/**
 $facet

Esta técnica nos permite ejecutar dos análisis diferentes (contar oportunidades
y contar cumplimientos) sobre la misma colección de datos en una sola pasada. 
Es mucho más rápido y eficiente
 */

// Endpoint 2: Obtener estadísticas de cumplimiento agrupadas por sector
exports.getComplianceBySector = async (req, res) => {
    try {
        const { mes } = req.query; // Capturamos el mes (ej: "03", "07", "11")
        let filtroFecha = {};

        // Filtro de fecha dinamico x actual
        if (mes) {
            const anioActual = new Date().getFullYear();
            const inicio = new Date(`${anioActual}-${mes}-01T00:00:00.000Z`);
            const fin = new Date(`${anioActual}-${mes}-31T23:59:59.999Z`);
            filtroFecha = { fecha: { $gte: inicio, $lte: fin } };
        }

        const statsBySector = await Observacion.aggregate([
            { $match: filtroFecha }, // 1. FILTRO POR MES (Si no hay mes, trae todos)
            
            // 2. Agrupamos directamente por el campo 'sector' (nombre nuevo)
            {
                $group: {
                    _id: "$sector", 
                    totalOportunidades: { $sum: 1 }, // Cada documento cuenta como 1
                    totalCumplimientos: {
                        $sum: {
                            $cond: [
                                { $and: [
                                    { $exists: ["$accion"] },
                                    { $ne: ["$accion", "Ninguna"] },
                                    { $ne: ["$accion", null] }
                                ]},
                                1, 0
                            ]
                        }
                    }
                }
            },

            // 3. Proyectamos y calculamos el porcentaje
            {
                $project: {
                    _id: 0,
                    sector: "$_id",
                    totalOportunidades: 1,
                    totalCumplimientos: 1,
                    porcentajeCumplimiento: {
                        $cond: [
                            { $eq: ["$totalOportunidades", 0] },
                            0,
                            { 
                                $round: [
                                    { $multiply: [{ $divide: ["$totalCumplimientos", "$totalOportunidades"] }, 100] }, 
                                    2
                                ] 
                            }
                        ]
                    }
                }
            },

            // 4. Ordenamos de mayor a menor cumplimiento
            { $sort: { porcentajeCumplimiento: -1 } }
        ]);
        res.json(statsBySector);    
    } catch (error) {
        console.error('Error al obtener datos por sector:', error);
        res.status(500).json({ message: 'Error al procesar sectores', error: error.message });
    }
};



// Endpoint 3: Obtener estadísticas de cumplimiento agrupadas por Rol Profesional
exports.getComplianceByProfessional = async (req, res) => {
    try {
        const { mes } = req.query; // 1. Capturamos el mes de la URL
        let filtroFecha = {};

        // 2. Configuramos el filtro si existe un mes
        if (mes) {
            const anioActual = new Date().getFullYear();
            const inicio = new Date(`${anioActual}-${mes}-01T00:00:00.000Z`);
            const fin = new Date(`${anioActual}-${mes}-31T23:59:59.999Z`);
            filtroFecha = { fecha: { $gte: inicio, $lte: fin } };
        }

        const statsByProfessional = await Observacion.aggregate([
            { $match: filtroFecha },
            {
              $group: {
                    _id: "$profesional", 
                    totalOportunidades: { $sum: 1 }, // 1 doc = 1 oportunidad
                    totalCumplimientos: {
                        $sum: {
                            $cond: [
                                { $and: [
                                    { $exists: ["$accion"] },
                                    { $ne: ["$accion", "Ninguna"] },
                                    { $ne: ["$accion", null] }
                                ]},
                                1, 0
                            ]
                        }
                    }
                }
            },

            // 3. Proyectamos resultados y calculamos el porcentaje redondeado
            {
                $project: {
                    _id: 0,
                    profesional: "$_id",
                    totalOportunidades: 1,
                    totalCumplimientos: 1,
                    porcentajeCumplimiento: {
                        $cond: [
                            { $eq: ["$totalOportunidades", 0] },
                            0,
                            { 
                                $round: [
                                    { $multiply: [{ $divide: ["$totalCumplimientos", "$totalOportunidades"] }, 100] }, 
                                    2
                                ] 
                            }
                        ]
                    }
                }
            },

            // 4. Ordenamos para el Ranking: del más cumplidor al menos
            { $sort: { porcentajeCumplimiento: -1 } }
        ]);  
        res.json(statsByProfessional);
    } catch (error) {
        console.error('Error al obtener datos por profesional:', error);
        res.status(500).json({ message: 'Error al procesar roles profesionales', error: error.message });
    }
};

// Endpoint 4: Obtener cumplimiento según el Momento de la observación
exports.getComplianceByMoment = async (req, res) => {
    try {
        const { mes } = req.query; // 1. Capturamos el mes
        let filtroFecha = {};

        // 2. Definimos el rango de fecha para 2025
        if (mes) {
           const anioActual = new Date().getFullYear();
            const inicio = new Date(`${anioActual}-${mes}-01T00:00:00.000Z`);
            const fin = new Date(`${anioActual}-${mes}-31T23:59:59.999Z`);
            filtroFecha = { fecha: { $gte: inicio, $lte: fin } };
        }
        const statsByMoment = await Observacion.aggregate([
            { $match: filtroFecha },
             {
               $group: {
                    _id: "$momento", 
                    totalOportunidades: { $sum: 1 },
                    totalCumplimientos: {
                        $sum: {
                            $cond: [
                                { $and: [
                                    { $exists: ["$accion"] },
                                    { $ne: ["$accion", "Ninguna"] },
                                    { $ne: ["$accion", null] }
                                ]},
                                1, 0
                            ]
                        }
                    }
                }
            },

            // 3. Proyectamos y redondeamos
            {
                $project: {
                    _id: 0,
                    momento: "$_id",
                    totalOportunidades: 1,
                    totalCumplimientos: 1,
                    porcentajeCumplimiento: {
                        $cond: [
                            { $eq: ["$totalOportunidades", 0] },
                            0,
                            { 
                                $round: [
                                    { $multiply: [{ $divide: ["$totalCumplimientos", "$totalOportunidades"] }, 100] }, 
                                    2
                                ] 
                            }
                        ]
                    }
                }
            },

            // 4. Ordenamos por nombre del momento (1 al 5)
            { $sort: { momento: 1 } }
        ]);

        res.json(statsByMoment);
    } catch (error) {
        console.error('Error al obtener datos por momento:', error);
        res.status(500).json({ message: 'Error al procesar momentos', error: error.message });
    }
};

// Endpoint 5: Obtener el uso de las diferentes técnicas de higiene
exports.getTechniqueUsage = async (req, res) => {
    try {
        // Podés agregar el filtro de mes aquí también si querés que el gráfico de torta cambie por mes
        const { mes } = req.query;
        let filtroFecha = {};

        if (mes) {
            const anioActual = new Date().getFullYear();
            const inicio = new Date(`${anioActual}-${mes}-01T00:00:00.000Z`);
            const fin = new Date(`${anioActual}-${mes}-31T23:59:59.999Z`);
            filtroFecha = { fecha: { $gte: inicio, $lte: fin } };
        }
        const statsByTechnique = await Observacion.aggregate([
            {
              $match: { 
                    ...filtroFecha,
                    accion: { $nin: [null, "Ninguna", ""] } 
                } 
            },

            // 2. Agrupamos por el nombre de la técnica
            {
                $group: {
                    _id: "$accion",
                    cantidad: { $sum: 1 }
                }
            },

            // 3. Formateamos la salida
            {
                $project: {
                    _id: 0,
                    tecnica: "$_id",
                    cantidad: 1
                }
            },

            // 4. Ordenamos por los más usados
            { $sort: { cantidad: -1 } }
        ]); 

        res.json(statsByTechnique);
    } catch (error) {
        console.error('Error al obtener técnicas:', error);
        res.status(500).json({ message: 'Error al procesar técnicas', error: error.message });
    }
};

// Endpoint 6: Obtener cumplimiento agrupado por Turno
exports.getComplianceByShift = async (req, res) => {
    try {
        const { mes } = req.query;
        let filtroFecha = {};

        // 1. Filtro dinámico: Año actual y campo 'fecha' unificado
        if (mes) {
            const anioActual = new Date().getFullYear();
            const inicio = new Date(`${anioActual}-${mes}-01T00:00:00.000Z`);
            const fin = new Date(`${anioActual}-${mes}-31T23:59:59.999Z`);
            filtroFecha = { fecha: { $gte: inicio, $lte: fin } };
        }

        const statsByShift = await Observacion.aggregate([
            {
              $match: { 
                    ...filtroFecha,
                    turno: { $ne: null, $ne: "" } 
                } 
            },

            // 3. Agrupamos directamente por el campo 'turno'
            {
                $group: {
                    _id: "$turno", 
                    totalOportunidades: { $sum: 1 }, // 1 doc = 1 oportunidad
                    totalCumplimientos: {
                        $sum: {
                            $cond: [
                                { $and: [
                                    { $exists: ["$accion"] },
                                    { $ne: ["$accion", "Ninguna"] },
                                    { $ne: ["$accion", null] }
                                ]},
                                1, 0
                            ]
                        }
                    }
                }
            },

            // 4. Proyectamos resultados y calculamos el porcentaje redondeado
            {
                $project: {
                    _id: 0,
                    turno: "$_id",
                    totalOportunidades: 1,
                    totalCumplimientos: 1,
                    porcentajeCumplimiento: {
                        $cond: [
                            { $eq: ["$totalOportunidades", 0] },
                            0,
                            { 
                                $round: [
                                    { $multiply: [{ $divide: ["$totalCumplimientos", "$totalOportunidades"] }, 100] }, 
                                    2
                                ] 
                            }
                        ]
                    }
                }
            },

            // 5. Ordenamos por porcentaje de cumplimiento
            { $sort: { porcentajeCumplimiento: -1 } }
        ]);

        res.json(statsByShift);
    } catch (error) {
        console.error('Error al obtener datos por turno:', error);
        res.status(500).json({ message: 'Error al procesar los turnos', error: error.message });
    }
};

//Endpoint 7 dinamico
exports.getStaffComplianceBySector = async (req, res) => {
    try {
        // Capturamos el nombre desde la URL
        const { nombreSector } = req.params; 
        const { mes } = req.query; // Capturamos el mes opcional de la URL (?mes=03)
        
        let filtroMatch = { sector: nombreSector };

        // 1. Filtro de fecha si se proporciona mes
        if (mes) {
            const anioActual = new Date().getFullYear();
            const inicio = new Date(`${anioActual}-${mes}-01T00:00:00.000Z`);
            const fin = new Date(`${anioActual}-${mes}-31T23:59:59.999Z`);
            filtroMatch.fecha = { $gte: inicio, $lte: fin };
        }

        const stats = await Observacion.aggregate([
            // 2. Filtramos por el sector y la fecha (muy eficiente)
            { $match: filtroMatch },
            // 3. Agrupamos por personal (usando el campo unificado)
            {
                $group: {
                    _id: "$profesional", // Nombre del campo unificado
                    totalOportunidades: { $sum: 1 },
                    totalCumplimientos: {
                        $sum: {
                            $cond: [
                                { $and: [
                                    { $exists: ["$accion"] },
                                    { $ne: ["$accion", "Ninguna"] },
                                    { $ne: ["$accion", null] }
                                ]},
                                1, 0
                            ]
                        }
                    }
                }
            },

            // 4. Formateamos y redondeamos
            {
                $project: {
                    _id: 0,
                    personal: "$_id",
                    totalOportunidades: 1,
                    totalCumplimientos: 1,
                    porcentajeCumplimiento: {
                        $cond: [
                            { $eq: ["$totalOportunidades", 0] },
                            0,
                            { 
                                $round: [
                                    { $multiply: [{ $divide: ["$totalCumplimientos", "$totalOportunidades"] }, 100] }, 
                                    2
                                ] 
                            }
                        ]
                    }
                }
            },

            // 5. Ordenamos: los mejores arriba
            { $sort: { porcentajeCumplimiento: -1 } }
        ]);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Error al procesar datos del sector' });
    }
};

//POST PARA NUEVO FORMULARIO
exports.crearObservacion = async (req, res) => {
    try {
        const { observador, sector, turno, profesional, momento, accion } = req.body;

        const nuevaObservacion = new Observacion({
            fecha: new Date(), // Esto genera: Sat Feb 28 2026 10:00:00 ...
            observador,
            sector,
            turno,
            profesional,
            momento,
            accion,
            // Opcional: llenar los campos viejos por si algún reporte los usa
            'Nombre del observador': observador,
            'Marca temporal': new Date()
        });

        await nuevaObservacion.save();
        res.status(201).json({ message: "Éxito", data: nuevaObservacion });
    } catch (error) {
        res.status(500).json({ message: "Error", error: error.message });
    }
};