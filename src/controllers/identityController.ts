import { Request, Response } from "express";
import {
    Contact,
    fetchAllContactsByPhoneNumberAndEmail,
} from "../models/contact";

interface ResultContact {
    primaryContactId: number;
    emails: string[];
    phoneNumbers: string[];
    secondaryContactIds: number[];
}

export const identify = async (req: Request, res: Response) => {
    try {
        const { phoneNumber, email } = req.body;

        let relatedContacts: Contact[] =
            await fetchAllContactsByPhoneNumberAndEmail(phoneNumber, email);

        let emails: string[] = [];
        let phoneNumbers: string[] = [];
        let secondaryContactIds: number[] = [];

        let contactResponse: ResultContact = {
            primaryContactId: 0,
            emails: [],
            phoneNumbers: [],
            secondaryContactIds: [],
        };

        relatedContacts.map((contact: Contact) => {
            if (contact.linkPrecedence === "primary") {
                contactResponse["primaryContactId"] = contact.id;

                contact.email && emails.push(contact.email);
                contact.phoneNumber && phoneNumbers.push(contact.phoneNumber);
            } else if (contact.linkPrecedence === "secondary") {
                !secondaryContactIds.includes(contact.id) &&
                    secondaryContactIds.push(contact.id);

                contact.email &&
                    !emails.includes(contact.email) &&
                    emails.push(contact.email);

                contact.phoneNumber &&
                    !phoneNumbers.includes(contact.phoneNumber) &&
                    phoneNumbers.push(contact.phoneNumber);
            }
        });

        contactResponse["emails"] = emails;
        contactResponse["phoneNumbers"] = phoneNumbers;
        contactResponse["secondaryContactIds"] = secondaryContactIds;

        res.status(200).send({ contact: contactResponse });
    } catch (e) {
        console.log(e);
        res.status(500).send("Error");
    }
};
