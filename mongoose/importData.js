const mongoose = require ("mongoose");
const fs = require ("fs");
const mongoUri = "mongodb+srv://claudiogomez23_db_user:Ps5KZfxLgEBYCnus@hdmpombocluster.efpblv1.mongodb.net/" 

const ObservacionSchema = new mongoose.Schema ({
    'Marca temporal': Date,
    'Nombre del observador': String,
    'Sector en el que realizo la observación': String,
    'Turno': String,
    'Personal al que observo': String,
    'Momento que observa': String,
    'Accion que realizo': String,
    'Momento que observa2': String, // renombrar si es necesario
    'Acción que realizo2': String
})

const Observacion = mongoose.model("Observacion", ObservacionSchema);
async function importData() {
    await mongoose.connect(mongoUri);

    try{
        const data = fs.readFileSync("observaciones_higiene.json", "utf-8");
        const jsonArray = JSON.parse(data);

        // Opcional: Limpia la colección antes de la importación
        await Observacion.deleteMany({});
        
        // Inserta todos los documentos
        await Observacion.insertMany(jsonArray);

        console.log(" Datos importados exitosamente a MongoDB.");
    } catch (error) {
        console.error(" Error al importar datos:", error);
    } finally {
        await mongoose.disconnect();
    }
   }

   importData()

   module.exports = Observacion