const Observacion = require("../models/Observacion")

// Función para unificar datos (puedes ponerla en tu controlador y llamarla una vez)
const unificarDatosHistoricos = async () => {
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

export default unificarDatosHistoricos();


// Endpoint 1: Obtener el resumen del cumplimiento global
exports.getGlobalCompliance = async (req, res) => {
    try {
        const { mes } = req.query; // Capturamos el mes (ej: "03", "07", "11")
        let filtroFecha = {};

        // Si el usuario elige un mes, filtramos el rango de fechas para el año 2025
        if (mes) {
            const inicio = new Date(`2025-${mes}-01T00:00:00.000Z`);
            const fin = new Date(`2025-${mes}-31T23:59:59.999Z`);
            filtroFecha = { "Marca temporal": { $gte: inicio, $lte: fin } }; //operadores de 
            // comparación fundamentales para filtrar datos, Greater Than or Equal, Less than or Equal
        }
      const stats = await Observacion.aggregate([ //pipeline de agregacion
        { $match: filtroFecha }, //filtro
        {
                $facet: { //analisis multidimencional en una sola consulta
                    // Calculamos el total de oportunidades (Momento 1 + Momento 2 si existe)
                    "totalOportunidades": [
                        {
                            $project: { //en cada fila revisa dos campos
                                counts: {
                                    $sum: [
                                        { $cond: [{ $ifNull: ["$Momento que observa", false] }, 1, 0] },
                                        { $cond: [{ $ifNull: ["$Momento que observa2", false] }, 1, 0] }
                                        //Si la fila tiene los dos momentos llenos, counts será 2.
                                        // Si solo tiene el primero, counts será 1.
                                        // Si están vacíos, será 0.
                                    ]
                                }
                            }
                        },
                        { $group: { _id: null, total: { $sum: "$counts" } } }
                        //_id: null: Significa no me agrupes por categorías, júntame todo en una sola bolsa
                    ],
                    // Calculamos el total de acciones efectivas (Accion 1 + Accion 2)
                    "totalCumplimientos": [
                        {
                            $project: {
                                cumplimientos: {
                                    $sum: [
                                        { 
                                            $cond: [
                                                { $and: [ //Es un operador lógico que exige 
                                                // que todas las condiciones de la lista sean
                                                //verdaderas. evita falsos positivos
                                                    { $ifNull: ["$Momento que observa", false] },
                                                    { $ne: ["$Accion que realizo", "Ninguna"] }, //not equal
                                                    { $ne: ["$Accion que realizo", null] }
                                                ]}, 1, 0 
                                            ] 
                                        },
                                        { 
                                            $cond: [
                                                { $and: [
                                                    { $ifNull: ["$Momento que observa2", false] },
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

// Endpoint: Obtener estadísticas de cumplimiento agrupadas por sector
exports.getComplianceBySector = async (req, res) => {
    try {
        const { mes } = req.query; // Capturamos el mes (ej: "03", "07", "11")
        let filtroFecha = {};

        // Si el usuario elige un mes, filtramos el rango de fechas para el año 2025
        if (mes) {
            const inicio = new Date(`2025-${mes}-01T00:00:00.000Z`);
            const fin = new Date(`2025-${mes}-31T23:59:59.999Z`);
            filtroFecha = { "Marca temporal": { $gte: inicio, $lte: fin } };
        }
        const statsBySector = await Observacion.aggregate([
            { $match: filtroFecha }, // 1. FILTRO POR MES (Si no hay mes, trae todos)
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
                                        { $ifNull: ["$Momento que observa", false] }, // Debe haber momento
                                        { $ne: ["$Accion que realizo", "Ninguna"] },
                                        { $ne: ["$Accion que realizo", null] }
                                    ]}, 1, 0 
                                ] 
                            },
                            { 
                                $cond: [
                                    { $and: [
                                        { $ifNull: ["$Momento que observa2", false] }, // Debe haber momento
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
                    _id: "$sector", //le ordenamos a mongo que junte los que tengan el mismo sector
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
                                ] // la division da 0.65 x eso multiplicamos x 100
                            },
                            100
                        ]
                    }
                }
            },
            { $sort: { porcentajeCumplimiento: -1 } } //de mayor a menor
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
        const { mes } = req.query; // 1. Capturamos el mes de la URL
        let filtroFecha = {};

        // 2. Configuramos el filtro si existe un mes
        if (mes) {
            const inicio = new Date(`2025-${mes}-01T00:00:00.000Z`);
            const fin = new Date(`2025-${mes}-31T23:59:59.999Z`);
            filtroFecha = { "Marca temporal": { $gte: inicio, $lte: fin } };
        }
        const statsByProfessional = await Observacion.aggregate([
            { $match: filtroFecha },
            {
                // 1. Calculamos oportunidades y cumplimientos por cada fila
                $project: {
                    rol: "$Personal al que observo",
                    oportunidadesEnFila: {
                        $sum: [
                            { $cond: [{ $ifNull: ["$Momento que observa", false] }, 1, 0] },
                            { $cond: [{ $ifNull: ["$Momento que observa2", false] }, 1, 0] }
                        ]
                    },
                    cumplimientosEnFila: {
                        $sum: [
                            { 
                                // Validación: Acción 1 válida solo si existe Momento 1
                                $cond: [
                                    { $and: [
                                        { $ifNull: ["$Momento que observa", false] },
                                        { $ne: ["$Accion que realizo", "Ninguna"] },
                                        { $ne: ["$Accion que realizo", null] }
                                    ]}, 1, 0 
                                ] 
                            },
                            { 
                                // Validación: Acción 2 válida solo si existe Momento 2
                                $cond: [
                                    { $and: [
                                        { $ifNull: ["$Momento que observa2", false] },
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
                // 2. Agrupamos por el rol profesional
                $group: {
                    _id: "$rol",
                    totalOportunidades: { $sum: "$oportunidadesEnFila" },
                    totalCumplimientos: { $sum: "$cumplimientosEnFila" }
                }
            },
            {
                // 3. Calculamos el porcentaje final
                $project: {
                    rol: "$_id",
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
            // 4. Ordenar para el ranking (del mejor al peor cumplimiento)
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
        const { mes } = req.query; // 1. Capturamos el mes
        let filtroFecha = {};

        // 2. Definimos el rango de fecha para 2025
        if (mes) {
            const inicio = new Date(`2025-${mes}-01T00:00:00.000Z`);
            const fin = new Date(`2025-${mes}-31T23:59:59.999Z`);
            filtroFecha = { "Marca temporal": { $gte: inicio, $lte: fin } };
        }
        const statsByMoment = await Observacion.aggregate([
            { $match: filtroFecha },
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
                                        { $ifNull: ["$Momento que observa", false] },
                                        { $ne: ["$Accion que realizo", "Ninguna"] },
                                        { $ne: ["$Accion que realizo", null] }
                                    ]}, 1, 0 
                                ] 
                            },
                            { 
                                $cond: [
                                    { $and: [
                                        { $ifNull: ["$Momento que observa2", false] },
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