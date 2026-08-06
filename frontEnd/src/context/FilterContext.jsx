import React, { createContext, useState, useContext } from "react";

const FilterContext = createContext();

export const FilterProvider = ({ children }) => {
    const [mes, setMes] = useState("");
    const [anio, setAnio] = useState("2025");

    return (
        <FilterContext.Provider value={{ mes, setMes, anio, setAnio }}>
            {children}
        </FilterContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useFilters = () => {
    const context = useContext(FilterContext);
    if(!context) {
        throw new Error("useFilters debe usarse dentro de un FilterProvider");
    }
    return context;
};
