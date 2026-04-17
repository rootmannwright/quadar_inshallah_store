import  { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail ({ to, subject, html }) {
    try {
        const response = await resend.emails.send({
            from: "Quadar Inshallah Co. <noreply@quadar-inshallah.com>",
            to,
            subject,
            html
        });
        return response;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;

    }
};