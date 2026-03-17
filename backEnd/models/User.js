const mongoose = require ("mongoose");
const bcrypt = require ("bcryptjs")

const UserSchema = new mongoose.Schema({
    nombre:{
        type: String,
        required: [true, "El nombre es obligatorio"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "El correo es obligatorio"],
        unique: true, // no permite dos usuarios con el mismo mail
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, "La contraseña es obligatoria"],
        minlength: 5
    },
    role: {
        type: String,
        enum: ["admin", "observer", "reader"],
        default: "reader"
    },
    active: {
        type: Boolean,
        default: true
    }
}, { timestamps: true }); //crea automaticamente campos "createAt" y "updateAt"

// --- CONFIGURACIÓN DEL PRE-SAVE HOOK ---
UserSchema.pre('save', async function(next) {
    // Solo encriptamos si la contraseña ha sido modificada (o es nueva)
    if (!this.isModified('password')) return next();

    try {
        // Generamos un "salt" (una semilla de aleatoriedad)
        const salt = await bcrypt.genSalt(10);
        // Hasheamos la contraseña
        this.password = await bcrypt.hash(this.password, salt);
        
    } catch (error) {
        throw error;
    }
});

// Método para comparar contraseñas después (para usar en el Login)
UserSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", UserSchema)