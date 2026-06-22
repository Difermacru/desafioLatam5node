import { joyaModel } from "../models/joya.model.js"
import { getDatabaseError } from "../database/database.error.js";

// Obtener todos las joyas
const getAllJoyas = async (req, res) => {
    const { limit = 2, order = "ASC", orderBy = "stock", page = 1 } = req.query;
    const isPageValid = /^[1-9]\d*$/.test(page);

    if (!isPageValid) {
        return res.status(400).json({ message: "Invalid page number, number >0" });
    }

    try {
        const joyas = await joyaModel.findAll({ limit, order, orderBy, page });
        return res.json(joyas);
    } catch (error) {
        console.log(error);
        if (error.code) {
            const { code, message } = getDatabaseError(error.code);
            return res.status(code).json({ message });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
};

const getJoyasByFilters = async (req, res) => {
    try {
        const joyas = await joyaModel.findByFilters(req.query);
        return res.json(joyas);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const joyasControllers = {
    getAllJoyas,
    getJoyasByFilters
}