import React, { createContext, useState, useContext } from "react";

// creamos espacio para los datos
const FilterContext = createContext();

// creamos el proveedor (envuelve la app)
export const FilterProvider = ({ children }) => {
    const [mes, setMes] = useState("");
    const [anio, setAnio] = useState("2025");

    return (
        <FilterContext.Provider value={{ mes, setMes, anio, setAnio }}>
            {children}
        </FilterContext.Provider>
    );
};

//Hook personalizado para usar el contexto facilmente
export const useFilters = () => {
    const context = useContext(FilterContext);
    if(!context) {
        throw new Error("useFilters debe usarse dentro de un FilterProvider")
    }
    return context;
}