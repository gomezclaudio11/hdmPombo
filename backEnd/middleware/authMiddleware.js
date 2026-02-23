const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
    // 1. LEE EL TOKEN QUE VIENE EN EL HEADER DE LA PETICION
    const token = req.header("x-auth-token");

    //2.revisar si no hay token
    if(!token) {
        return res.status(401).json({ message: "No hay token, permiso no valido" });
    }

    //3. validar el token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //4 añadir el usuario (id y rol) a la peticion para el controlar lo use
        req.user = decoded;
        next(); //contuar al siguiente paso (el controlador)
    } catch (error) {
        res.status(401).json({ message: "Token no es valido" })
    }
};

//Middleware para verificar Roles especificos
const checkRole = (rolesPermitidos) => {
    return (req, res, next) => {
        //verificamos si el rol del usuario esta en la lista de permitidos
        if(!rolesPermitidos.includes(req.user.role)) {
            return res.status(403).json({
                message: `Acceso denegado: tu rol de ${req.user.role} no tiene permiso para esta accion`
            });
        }
        next();
    }
}

module.exports = { auth, checkRole };

/**
 Diferencia entre Error 401 y 403 
   401 Unauthorized: "No sé quién eres" (No hay token o es falso).
   403 Forbidden: "Sé quién eres, pero no tienes permiso para entrar aquí" 
  (Eres un Lector intentando borrar algo de un Admin).
 */