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

    let contacts: Contact[] = [];

    let sqlQuery: string;
    if (!phoneNumber) {
        sqlQuery = `SELECT * FROM public.contact WHERE email='${email}'`;
    } else if (!email) {
        sqlQuery = `SELECT * FROM public.contact WHERE "phoneNumber"='${phoneNumber}'`;
    } else {
        sqlQuery = `SELECT * FROM public.contact WHERE email='${email}' OR "phoneNumber"='${phoneNumber}'`;
    }

    const result = await client.query(sqlQuery);
    const rows: Contact[] = result.rows;

    contacts.push(...rows);

    if (
        contacts.some(
            (contact: Contact) => contact.linkPrecedence === "primary"
        )
    ) {
        let primaryContact = contacts.filter(
            (contact) => contact.linkPrecedence === "primary"
        );

        let secondaryContactsSQLQuery = `SELECT * FROM public.contact WHERE "linkedId"='${primaryContact[0].id}'`;

        const newResult = await client.query(secondaryContactsSQLQuery);
        const newRows: Contact[] = newResult.rows;

        contacts.push(...newRows);

        client.release();

        return contacts;
    }

    let primaryContactsSQLQuery = `SELECT * FROM public.contact WHERE id='${contacts[0].linkedId}'`;

    const newResult = await client.query(primaryContactsSQLQuery);
    const newRows: Contact[] = newResult.rows;

    contacts.push(...newRows);

    client.release();

    return contacts;
};
