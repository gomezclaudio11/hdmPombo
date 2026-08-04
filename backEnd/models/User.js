const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, "El nombre es obligatorio"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "El correo es obligatorio"],
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function(email) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            },
            message: "Invalid email format"
        }
    },
    password: {
        type: String,
        required: [true, "La contraseña es obligatoria"],
        minlength: [8, "La contraseña debe tener al menos 8 caracteres"],
        validate: {
            validator: function(password) {
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);
            },
            message: "La contraseña debe contener al menos una letra mayúscula, una letra minúscula y un número"
        }
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
}, { timestamps: true });

// Enhanced pre-save hook with better error handling
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        throw error;
    }
});

// Method to compare passwords after (for use in Login)
UserSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to strip sensitive data from user object
UserSchema.methods.toSafeObject = function() {
    const obj = this.toObject();
    delete obj.password;
    delete obj.__v;
    return obj;
};

module.exports = mongoose.model("User", UserSchema);