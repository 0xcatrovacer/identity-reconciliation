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
    phoneNumber: string,
    email: string
): Promise<Contact[]> => {
    const client: PoolClient = await pool.connect();

    let contacts: Contact[] = [];

    if (phoneNumber && email) {
        let sqlQuery = `SELECT * FROM public.contact WHERE email='${email}' AND "phoneNumber"='${phoneNumber}'`;
        let { rows } = await client.query(sqlQuery);

        if (rows.length === 0) {
            let primaryContactQuery = `SELECT * FROM public.contact WHERE email='${email}' OR "phoneNumber"='${phoneNumber}'`;

            let primaryContactResult = await client.query(primaryContactQuery);

            let primaryContactArray: Contact[] =
                primaryContactResult.rows.filter(
                    (contact: Contact) => contact.linkPrecedence === "primary"
                );

            let primaryContact: Contact;

            if (primaryContactArray.length === 0) {
                let idLinkedContacts: Contact[] =
                    primaryContactResult.rows.filter(
                        (contact: Contact) => contact.linkedId !== null
                    );

                let newQuery = `SELECT * FROM public.contact WHERE id='${idLinkedContacts[0].linkedId}' AND "linkPrecedence"='primary'`;

                const newRes = await client.query(newQuery);
                primaryContact = newRes.rows[0];
            } else {
                primaryContact = primaryContactArray[0];
            }

            await createNewContact(
                phoneNumber,
                email,
                "secondary",
                primaryContact.id
            );
        }
    }

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

    if (rows.length == 0) {
        return [];
    }

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

export const createNewContact = async (
    phoneNumber: string,
    email: string,
    linkPrecedence: "primary" | "secondary",
    linkedId?: number
): Promise<Contact> => {
    const client: PoolClient = await pool.connect();

    const insertQuery = `INSERT INTO public.contact(id, "phoneNumber", email, "linkPrecedence", "createdAt", "updatedAt"${
        linkedId && ', "linkedId"'
    }) VALUES ($1, $2, $3, $4, $5, $6${linkedId && ", $7"}) RETURNING *;`;
    const values = [
        19,
        phoneNumber,
        email,
        linkPrecedence,
        new Date(),
        new Date(),
        linkedId,
    ];

    const { rows } = await client.query(insertQuery, values);
    const contact: Contact = rows[0];

    return contact;
};
