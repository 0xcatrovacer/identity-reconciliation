import { PoolClient } from "pg";
import pool from "../database/dbConnection";

export interface Contact {
    id: number;
    phoneNumber: string;
    email: string;
    linkedId: number;
    linkPrecedence: "secondary" | "primary";
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}

export const fetchAllContactsByPhoneNumberAndEmail = async (
    phoneNumber: number,
    email: string
): Promise<Contact[]> => {
    const client: PoolClient = await pool.connect();

    const sqlQuery = `SELECT * FROM contact WHERE ${
        phoneNumber && '"phoneNumber" = \'' + phoneNumber + "' OR"
    } ${email && "email = '" + email + "'"}`;

    const { rows } = await client.query(sqlQuery);

    client.release();

    return rows;
};
