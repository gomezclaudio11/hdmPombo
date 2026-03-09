const Observacion = require("../models/Observacion")

// Función para unificar datos LLAMARLA UNA VEZ
exports.unificarDatosHistoricos = async () => {
    try {
        // Buscamos documentos que NO tengan el campo 'profesional' 
        // o donde 'profesional' sea null/indefinido
        const datosViejos = await Observacion.find({
            $or: [
                { profesional: { $exists: false } },
                { accion: null },
                { accion: "" },
                { sector: { $exists: false } }
            ]
        });

        console.log(`Iniciando unificación de ${datosViejos.length} registros...`);

        let actualizados = 0;

        for (let doc of datosViejos) {
            // Mapeo seguro: Si el campo viejo existe, lo usamos. Si no, mantenemos lo que hay.
            doc.fecha = doc['Marca temporal'] || doc.fecha || doc.createdAt;
            doc.observador = doc['Nombre del observador'] || doc.observador;
            doc.sector = doc['Sector en el que realizo la observación'] || doc.sector;
            doc.profesional = doc['Personal al que observo'] || doc.profesional;
            doc.momento = doc['Momento que observa'] || doc.momento;
            doc.turno = doc['Turno'] || doc.turno;

            // 2. Lógica Especial para la ACCIÓN (Limpieza de NULLs)
            // Priorizamos el campo viejo, luego el nuevo, y si ambos fallan -> "Ninguna"
            let accionOriginal = doc['Accion que realizo'] || doc.accion;

            if (!accionOriginal || accionOriginal === null || accionOriginal === "" || accionOriginal === "null") {
                doc.accion = "Ninguna";
            } else {
                doc.accion = accionOriginal;
            }

            // 3. Guardar cambios
            await doc.save();
            actualizados++;

           }

        console.log(`Unificación completada: ${actualizados} registros procesados.`);
        
       if (res) {
            res.json({
                status: "success",
                message: "Limpieza y unificación completada",
                totalProcesados: actualizados
            });
        }
    } catch (error) {
        console.error("Error en unificación:", error);
        if (res) res.status(500).json({ error: error.message });
    }
};


// Endpoint 1: Obtener el resumen del cumplimiento global
exports.getGlobalCompliance = async (req, res) => {
    try {
        const { mes, anio } = req.query; // Capturamos el mes (ej: "03", "07", "11")
        let filtroFecha = {};

        // Creamos un array de condiciones para el $and
        let condiciones = [];

        // DEBUG: Esto saldrá en los logs de Render
        console.log(`Buscando Filtros -> Mes: ${mes}, Año: ${anio}`);

        // Si envían mes, extraemos el mes de la fecha
        if (mes && mes !== "" && mes !== "undefined") {
            condiciones.push({ $eq: [{ $month: "$fecha" }, parseInt(mes)] });
        }

        // Si envían año, extraemos el año de la fecha
        if (anio && anio !== "" && anio !== "undefined") {
            condiciones.push({ $eq: [{ $year: "$fecha" }, parseInt(anio)] });
        }

        // Si hay alguna condición, usamos $expr para filtrar
        if (condiciones.length > 0) {
            filtroFecha = { $expr: { $and: condiciones } };
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
                                accion: { $exists: true, $nin: [null, "null", "", "Ninguna"] }
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
         const { mes, anio } = req.query; // Capturamos el mes (ej: "03", "07", "11")
        let filtroFecha = {};
        let condiciones = [];

        if (mes && mes !== "" && mes !== "undefined") {
            condiciones.push({ $eq: [{ $month: "$fecha" }, parseInt(mes)] });
        }

        if (anio && anio !== "" && anio !== "undefined") {
            condiciones.push({ $eq: [{ $year: "$fecha" }, parseInt(anio)] });
        }

        if (condiciones.length > 0) {
            filtroFecha = { $expr: { $and: condiciones } };
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
                                    { $exists: ["$accion", true] },
                                    { $ne: ["$accion", ""] },
                                    { $ne: ["$accion", "Ninguna"] },
                                    { $ne: ["$accion", null] },
                                    { $ne: ["$accion", "null"] },
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
           const { mes, anio } = req.query; // Capturamos el mes (ej: "03", "07", "11")
        let filtroFecha = {};
        let condiciones = [];

        if (mes && mes !== "" && mes !== "undefined") {
            condiciones.push({ $eq: [{ $month: "$fecha" }, parseInt(mes)] });
        }

        if (anio && anio !== "" && anio !== "undefined") {
            condiciones.push({ $eq: [{ $year: "$fecha" }, parseInt(anio)] });
        }

        if (condiciones.length > 0) {
            filtroFecha = { $expr: { $and: condiciones } };
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
                                    { $exists: ["$accion", true] },
                                    { $ne: ["$accion", ""] },
                                    { $ne: ["$accion", "Ninguna"] },
                                    { $ne: ["$accion", null] }, 
                                    { $ne: ["$accion", "null"] } 
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
          const { mes, anio } = req.query; // Capturamos el mes (ej: "03", "07", "11")
        let filtroFecha = {};
        let condiciones = [];

        if (mes && mes !== "" && mes !== "undefined") {
            condiciones.push({ $eq: [{ $month: "$fecha" }, parseInt(mes)] });
        }

        if (anio && anio !== "" && anio !== "undefined") {
            condiciones.push({ $eq: [{ $year: "$fecha" }, parseInt(anio)] });
        }

        if (condiciones.length > 0) {
            filtroFecha = { $expr: { $and: condiciones } };
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
                                    { $exists: ["$accion", true] },
                                    { $ne: ["$accion", ""] },
                                    { $ne: ["$accion", "Ninguna"] },
                                    { $ne: ["$accion", null] },
                                    { $ne: ["$accion", "null"] },
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
           const { mes, anio } = req.query; // Capturamos el mes (ej: "03", "07", "11")
        let condiciones = [];

        // 1. Siempre filtramos para que la acción SEA una técnica válida
        // Excluimos null, "null" (texto), "Ninguna" y vacíos
        let matchStage = { 
            accion: { $exists: true, $nin: [null, "null", "Ninguna", ""] } 
        };
        if (mes && mes !== "" && mes !== "undefined") {
            condiciones.push({ $eq: [{ $month: "$fecha" }, parseInt(mes)] });
        }

        if (anio && anio !== "" && anio !== "undefined") {
            condiciones.push({ $eq: [{ $year: "$fecha" }, parseInt(anio)] });
        }

        if (condiciones.length > 0) {
           matchStage = {
                $and: [
                    matchStage,
                    { $expr: { $and: condiciones } }
                ]
            }; 
        }

        const statsByTechnique = await Observacion.aggregate([
            { $match: matchStage },

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
           const { mes, anio } = req.query; // Capturamos el mes (ej: "03", "07", "11")
            let filtroFinal = { turno: { $ne: null, $ne: "" } }; // Filtro base: que el turno exista
           let condiciones = [];

        if (mes && mes !== "" && mes !== "undefined") {
            condiciones.push({ $eq: [{ $month: "$fecha" }, parseInt(mes)] });
        }

        if (anio && anio !== "" && anio !== "undefined") {
            condiciones.push({ $eq: [{ $year: "$fecha" }, parseInt(anio)] });
        }

        if (condiciones.length > 0) {
            filtroFinal = {
                $and: [
                    { turno: { $ne: null, $ne: "" } },
                    { $expr: { $and: condiciones } }
                ]
            };
        }

        const statsByShift = await Observacion.aggregate([
            { match: filtroFinal },

            // 3. Agrupamos directamente por el campo 'turno'
            {
                $group: {
                    _id: "$turno", 
                    totalOportunidades: { $sum: 1 }, // 1 doc = 1 oportunidad
                    totalCumplimientos: {
                        $sum: {
                            $cond: [
                                { $and: [
                                    { $exists: ["$accion", true] },
                                    { $ne: ["$accion", ""] },
                                    { $ne: ["$accion", "Ninguna"] },
                                    { $ne: ["$accion", null] },
                                    { $ne: ["$accion", "null"] }
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
        const { mes, anio } = req.query; // Capturamos el mes (ej: "03", "07", "11")
        
        let filtroFinal = { sector: nombreSector };
        let condicionesFecha = [];

        if (mes && mes !== "" && mes !== "undefined") {
            condicionesFecha.push({ $eq: [{ $month: "$fecha" }, parseInt(mes)] });
        }

        if (anio && anio !== "" && anio !== "undefined") {
            condicionesFecha.push({ $eq: [{ $year: "$fecha" }, parseInt(anio)] });
        }
        
        if (condicionesFecha.length > 0) {
            filtroFecha = { 
                $and: [
                    { sector: nombreSector },
                    { $expr: { $and: condicionesFecha } }
                ]    
                } ;
        }

        const stats = await Observacion.aggregate([
            // 2. Filtramos por el sector y la fecha (muy eficiente)
            { $match: filtroFecha },
            // 3. Agrupamos por personal (usando el campo unificado)
            {
                $group: {
                    _id: "$profesional", // Nombre del campo unificado
                    totalOportunidades: { $sum: 1 },
                    totalCumplimientos: {
                        $sum: {
                            $cond: [
                                { $and: [
                                    { $exists: ["$accion", true] },
                                    { $ne: ["$accion", ""] },
                                    { $ne: ["$accion", "Ninguna"] },
                                    { $ne: ["$accion", null] },
                                    { $ne: ["$accion", "null"] }
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