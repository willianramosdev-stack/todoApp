import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendEmail(user: any, otp: number) {
    try {
        const { data, error } = await resend.emails.send({
            from: 'Acme <onboarding@resend.dev>',
            to: [user.email],
            subject: 'Recovery Code',
            html: `<strong>Recovery Code: ${otp} expires in 15 minutes!</strong>`,
        });

        if (error) {
            throw new Error('Failed to send email');
        }

        return { success: true, data };

    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}