const Observacion = require("../models/Observacion")

// Endpoint 1: Obtener el resumen del cumplimiento global
exports.getGlobalCompliance = async (req, res) => {
    try {
        // 1. Contar el total de observaciones
        const totalObservations = await Observacion.countDocuments();
        
        // 2. Contar los casos donde se realizó ALGUNA acción (no fue "Ninguna")
        const cumplimientos = await Observacion.aggregate([
            // Filtra los casos donde la primera acción NO es "Ninguna"
            { $match: { 'Accion que realizo': { $ne: null } } },
            // Cuenta los resultados
            { $count: 'totalCumplimiento' }
        ]);

        const totalCumplimiento = cumplimientos.length > 0 ? cumplimientos[0].totalCumplimiento : 0;
        
        const porcentajeCumplimiento = totalObservations > 0 
            ? ((totalCumplimiento / totalObservations) * 100).toFixed(2) 
            : 0;

        res.json({
            totalObservaciones: totalObservations,
            accionesRealizadas: totalCumplimiento,
            porcentajeCumplimiento: parseFloat(porcentajeCumplimiento)
        });

    } catch (error) {
        console.error('Error al obtener el cumplimiento global:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

// Endpoint: Obtener estadísticas de cumplimiento agrupadas por sector
exports.getComplianceBySector = async (req, res) => {
    try {
        const statsBySector = await Observacion.aggregate([
            {
                $group: {
                    _id: "$Sector en el que realizo la observación", // Campo por el cual agrupamos [cite: 1]
                    totalObservaciones: { $sum: 1 },
                    accionesCorrectas: {
                        $sum: {
                            $cond: [
                                { $and: [
                                    { $ne: ["$Accion que realizo", "Ninguna"] },
                                    { $ne: ["$Accion que realizo", null] }
                                ]}, 
                                1, 0
                            ]
                        }
                    }
                }
            },
            {
                $project: {
                    sector: "$_id",
                    totalObservaciones: 1,
                    accionesCorrectas: 1,
                    porcentajeCumplimiento: {
                        $multiply: [
                            { $divide: ["$accionesCorrectas", "$totalObservaciones"] },
                            100
                        ]
                    }
                }
            },
            { $sort: { porcentajeCumplimiento: -1 } } // Ordenar de mayor a menor cumplimiento
        ]);

        res.json(statsBySector);
    } catch (error) {
        console.error('Error al obtener datos por sector:', error);
        res.status(500).json({ message: 'Error al procesar sectores', error: error.message });
    }
};

/**
 Entender el método .aggregate() es fundamental porque es la herramienta más 
 poderosa de MongoDB para generar estadísticas. En lugar de traer todos los
 datos a tu servidor y calcularlos con JavaScript, dejas que la base de datos 
haga el trabajo pesado de forma mucho más eficiente.

Este proceso funciona como una tubería (pipeline): los datos entran por un 
extremo y pasan por diferentes "estaciones" de procesamiento hasta que sale
el resultado final procesado.
Paso 1: $group (La agrupación y el conteo)

Esta es la fase donde se clasifican los documentos.

    _id: "$Sector en el que realizo la observación": Le dices a MongoDB que 
    cree una bolsa por cada sector diferente que encuentre (ej. "7mo piso", 
    "UTI ADULTO", "GUARDIA").

totalObservaciones: { $sum: 1 }: Por cada documento que cae en una "bolsa", 
suma 1. Esto nos da el total de muestras por sector.

accionesCorrectas (La lógica del cumplimiento): Aquí usamos un condicional 
$cond:

    $and: Verifica que se cumplan dos cosas: que la acción no sea "Ninguna" Y 
    que no sea null.

Si es verdad (cumple): Devuelve un 1.

Si es mentira (falló): Devuelve un 0.

$sum: Suma todos esos 1s para decirnos cuántas veces el personal sí se lavó 
las manos o usó alcohol.

Paso 2: $project (El cálculo matemático)

En esta fase, le damos forma a la salida y realizamos cálculos sobre los 
totales obtenidos en el paso anterior.

    sector: "$_id": Simplemente renombramos el campo técnico _id a algo más 
    legible como sector.

    totalObservaciones: 1 y accionesCorrectas: 1: El número 1 aquí significa 
    "mostrar". Queremos que estos datos aparezcan en el resultado final.

    porcentajeCumplimiento: Realiza la operación aritmética:

        $divide: Divide las acciones correctas por el total de observaciones.

$multiply: Multiplica el resultado por 100 para convertirlo en un porcentaje 
(ej. de 0.75 a 75).

Paso 3: $sort (El orden jerárquico)

Finalmente, organizamos la lista.

    { porcentajeCumplimiento: -1 }: El -1 indica orden descendente 
     (de mayor a menor). Esto es ideal para un Dashboard porque pone los 
     sectores con mejor desempeño arriba de todo.
 */

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
                // Agrupamos por el campo "Momento que observa"
                $group: {
                    _id: "$Momento que observa",
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
                // Filtramos resultados vacíos o nulos que puedan venir del CSV
                $match: { "_id": { $ne: null } }
            },
            {
                // Proyectamos y calculamos el porcentaje
                $project: {
                    momento: "$_id",
                    totalObservaciones: 1,
                    accionesCorrectas: 1,
                    porcentajeCumplimiento: {
                        $multiply: [
                            { $divide: ["$accionesCorrectas", "$totalObservaciones"] },
                            100
                        ]
                    }
                }
            },
            { $sort: { porcentajeCumplimiento: -1 } }
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
                // Agrupamos por el campo de la acción realizada
                $group: {
                    _id: "$Accion que realizo",
                    cantidad: { $sum: 1 }
                }
            },
            {
                // Limpiamos nulos y la opción "Ninguna" para ver solo técnicas activas
                $match: { 
                    "_id": { $nin: [null, "Ninguna", ""] } 
                }
            },
            {
                $project: {
                    tecnica: "$_id",
                    cantidad: 1,
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
                // Agrupamos por el campo "Turno"
                $group: {
                    _id: "$Turno",
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
                // Limpiamos posibles registros con turno vacío
                $match: { "_id": { $ne: null, $ne: "" } }
            },
            {
                // Calculamos el porcentaje final
                $project: {
                    turno: "$_id",
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
            // Ordenamos alfabéticamente o por porcentaje
            { $sort: { porcentajeCumplimiento: -1 } }
        ]);

        res.json(statsByShift);
    } catch (error) {
        console.error('Error al obtener datos por turno:', error);
        res.status(500).json({ message: 'Error al procesar los turnos', error: error.message });
    }
};