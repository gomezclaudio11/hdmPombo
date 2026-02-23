import axios from "axios";

const clienteAxios = axios.create({
    baseURL: "https://hdmpombo.onrender.com/api"
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