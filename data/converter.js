const fs = require('fs');

// --- Configuración ---
const csvFilePath = 'hdmNoviembreFinal.csv';
const jsonFilePath = 'observaciones_higiene.json';
const delimiter = ','; // El delimitador en tu archivo CSV

// --- Función de conversión de CSV a JSON ---
function csvToJson(csvData) {
    // 1. Separar las líneas (registros)
    // Se usa un regex para manejar posibles saltos de línea tanto de Windows (\r\n) como de Unix/Linux (\n)
    const lines = csvData.trim().split(/\r?\n/);
    if (lines.length === 0) {
        return [];
    }

    // 2. Extraer los encabezados (la primera línea)
    // Se eliminan los espacios en blanco alrededor de los nombres de las columnas
    const headers = lines[0].split(delimiter).map(header => header.trim());

    // 3. Procesar el resto de las líneas de datos
    const result = [];
    for (let i = 1; i < lines.length; i++) {
        const currentLine = lines[i];
        
        // Manejo de CSV básico: Dividir por el delimitador.
               const values = currentLine.split(delimiter).map(value => value.trim());

        if (values.length !== headers.length) {
            // Esto ayuda a depurar si alguna línea está mal formada.
            console.warn(` Línea omitida debido a un número incorrecto de columnas: ${currentLine}`);
            continue;
        }

        const obj = {};
        for (let j = 0; j < headers.length; j++) {
            let key = headers[j];
            let value = values[j];

            // Conversión y Limpieza de datos
            if (key === 'Marca temporal') {
                if (value && value.includes('/')) {
                    // 1. Separar la fecha de la hora
                    const [fechaParte] = value.split(' ');
                    // 2. Separar día, mes y año
                    const [dia, mes, anio] = fechaParte.split('/');
                    
                    // 3. Crear un objeto Date válido (YYYY, MM-1, DD)
                    // Restamos 1 al mes porque en JS los meses van de 0 a 11
                    const fechaObjeto = new Date(anio, mes - 1, dia);

                    // Guardar como objeto Date (recomendado para filtros)
                    // Pero forzamos que sea solo la fecha sin hora (00:00:00)
                    obj[key] = fechaObjeto;
              } else {
                    obj[key] = null;
                }
            } else {
                // Almacena la cadena tal cual, o 'null' si está vacía.
                obj[key] = value === 'Ninguna' || value === '' || value === '""' ? null : value;
            }
        }
        result.push(obj);
    }

    return result;
}

// --- Lógica principal del script ---
try {
    // 1. Leer el archivo CSV
    const csvData = fs.readFileSync(csvFilePath, 'utf8');

    // 2. Convertir a Array de objetos (JSON)
    const jsonArray = csvToJson(csvData);

    // 3. Escribir el Array a un nuevo archivo JSON
    fs.writeFileSync(jsonFilePath, JSON.stringify(jsonArray, null, 2), 'utf8');

    console.log(`✅ ¡Conversión completada!`);
    console.log(`Se procesaron ${jsonArray.length} registros y se guardaron en: ${jsonFilePath}`);

} catch (error) {
    console.error(`❌ Error al procesar el archivo: ${error.message}`);
    // Si el error es ENOENT, significa que el archivo no fue encontrado.
    if (error.code === 'ENOENT') {
        console.error(`Asegúrate de que el archivo CSV esté en la misma carpeta.`);
    }
}