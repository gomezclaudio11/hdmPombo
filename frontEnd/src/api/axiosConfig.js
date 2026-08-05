import axios from "axios";

const clienteAxios = axios.create({
    baseURL: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:3001/api" : "https://hdmpombo.onrender.com/api")
});

clienteAxios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers["x-auth-token"] = token;
        }
        return config
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default clienteAxios;