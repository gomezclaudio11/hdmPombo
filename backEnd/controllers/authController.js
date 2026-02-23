const User = require ("../models/User");
const jwt = require ("jsonwebtoken");

exports.register = async (req, res) => {
    try {
        const { nombre, email, password, role } = req.body;

        // 1. verifico si el usuario existe
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "El usuario ya existe"})
        }

        //2. creo un nuevo usuario
        //al hacer .save(), se dispara el pre-save hook y encripta la password
        user = new User ({
            nombre,
            email,
            password,
            role
        });

        await user.save();

        res.status(200).json({
            message: "Usuario creado con exito",
            user: {
                id: user._id,
                nombre: user.nombre,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al registrar usuario', error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        //1. verifico si el usuario existe
        const user = await User.findOne({ email }) 
        if (!user) {
            return res.status(400).json({ message: "Credenciales invalidas" });
        }

        //2. comparo la contraseña ingresada con la encriptada en la BD
        //metodo creado en modeloAuth
        const isMatch = await user.comparePassword(password);
        if(!isMatch) {
            return res.status(400).json({ message: "Credenciales invalidas" })
        }

        //3. si todo esta ok, crear el token JWT
        const token = jwt.sign(
            {id: user._id, role: user.role }, //lo que queremos que el token sepa
            process.env.JWT_SECRET,           //clave secreta definida en .env
            { expiresIn: "8h" }               //tiempo de validez
        );

        res.json({
            token,
            user: {
                id: user._id,
                nombre: user.nombre,
                role: user.role
            }
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
}

