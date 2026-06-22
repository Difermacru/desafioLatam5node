import "dotenv/config";
import format from "pg-format";
import { pool } from "../database/connection.js";

const BASE_URL = process.env.NODE_ENV === "production" ? process.env.DOMAIN_URL_APP : `http://localhost:${process.env.PORT}`;

// Función para obtener todos los registros con paginación
const findAll = async ({
    limit = 2,
    order = "ASC",
    orderBy = "stock",
    page = 1
}) => {
    const countQuery = "SELECT COUNT(*) FROM inventario";
    const { rows: countResult } = await pool.query(countQuery);
    const total_rows = parseInt(countResult[0].count, 10);
    const total_pages = Math.ceil(total_rows / limit);
    const query = "SELECT * FROM inventario ORDER BY %s  %s LIMIT %s OFFSET %s";
    const offset = (page - 1) * limit;
    const formattedQuery = format(
        query,
        orderBy,
        order,
        limit,
        offset
    );
    const { rows } = await pool.query(formattedQuery);

    const results = rows.map((row) => {
        return {
            ...row,
            href: `${BASE_URL}/joyas/${row.id}`,
        };
    });

    return {
        results,
        total_pages,
        page,
        limit,
        next: total_pages <= page ? null : `${BASE_URL}/joyas?limit=${limit}&page=${page + 1}`,
        previous: page <= 1 ? null : `${BASE_URL}/joyas?limit=${limit}&page=${page - 1}`,
    };
};

const findByFilters = async ({ precio_max, precio_min, tipo_categoria, tipo_metal }) => {
    let filtros = [];
    const values = [];

    const agregarFiltro = (campo, comparador, valor) => {
        values.push(valor);
        filtros.push(`${campo} ${comparador} $${values.length}`);
    };

    if (precio_max) agregarFiltro('precio', '<=', precio_max);
    if (precio_min) agregarFiltro('precio', '>=', precio_min);
    if (tipo_categoria) agregarFiltro('categoria', '=', tipo_categoria);
    if (tipo_metal) agregarFiltro('metal', '=', tipo_metal);

    let consulta = "SELECT * FROM inventario";
    if (filtros.length > 0) {
        consulta += ` WHERE ${filtros.join(" AND ")}`;
    }

    const { rows } = await pool.query(consulta, values);
    return rows;
};

export const joyaModel = {
    findAll,
    findByFilters
}