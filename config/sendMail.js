// mailgunConfig.js
require("dotenv").config();
const formData = require("form-data");
const Mailgun = require("mailgun.js");

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY,
});

async function sendEmailNoCC(from, subject, to, MessageText, MessageHtml) {
    if (!subject || !to || !MessageText || !MessageHtml) {
        throw new Error("All Fields Required (no CC version)");
    }

    const domain = process.env.MAILGUN_DOMAIN;
    if (!domain) {
        throw new Error("MAILGUN_DOMAIN not set in environment");
    }

    const messageData = {
        from,
        to: [to],
        subject,
        text: MessageText,
        html: MessageHtml,
    };

    // Send message via Mailgun
    return mg.messages.create(domain, messageData);
}

async function sendEmailWithCC(from, subject, to, MessageText, MessageHtml, cc) {
    if (!subject || !to || !MessageText || !MessageHtml) {
        throw new Error("All Fields Required (with CC version)");
    }

    const domain = process.env.MAILGUN_DOMAIN;
    if (!domain) {
        throw new Error("MAILGUN_DOMAIN not set in environment");
    }

    const messageData = {
        from,
        to: [to],
        cc: Array.isArray(cc) ? cc : [cc], // handle single or array
        subject,
        text: MessageText,
        html: MessageHtml,
    };

    return mg.messages.create(domain, messageData);
}

/**
 * Emulated overloaded function:
 * - (from, subject, to, MessageText, MessageHtml)
 * - (from, subject, to, MessageText, MessageHtml, cc)
 */
async function sendEmailMailgun() {
    if (arguments.length === 5) {
        // No CC version
        return sendEmailNoCC(...arguments);
    } else if (arguments.length === 6) {
        // With CC
        return sendEmailWithCC(...arguments);
    } else {
        throw new Error("Invalid number of arguments for sendEmailMailgun()");
    }
}

module.exports = { sendEmailMailgun };
