const nodemailer = require('nodemailer');
const config = require('./config');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const emailService = {
    async sendPasswordResetEmail(toEmail, resetToken) {
        const resetUrl = `${config.FRONTEND_URL}/reset-password?token=${resetToken}`;

        const mailOptions = {
            from: process.env.EMAIL_FROM || '"HDM Pombo - Sistema de Higiene" <noreply@hdmpombo.com>',
            to: toEmail,
            subject: 'Recuperación de Contraseña - HDM Pombo',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #0056b3; text-align: center;">HDM Pombo</h2>
                    <h3 style="color: #333;">Solicitud de Recuperación de Contraseña</h3>
                    <p>Has solicitado restablecer tu contraseña en el sistema de vigilancia de higiene.</p>
                    <p>Haz clic en el siguiente botón para continuar (el enlace es válido por 15 minutos):</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="background-color: #0056b3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Restablecer Contraseña</a>
                    </div>
                    <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 0.8rem; color: #777; text-align: center;">Hospital HDM Pombo - Sistema automatizado</p>
                </div>
            `
        };

        // If SMTP credentials are not provided in development, log to console for easy testing
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.log('----------------------------------------------------');
            console.log(' [DEV MODE] SMTP credentials not configured.');
            console.log(` Password reset link for ${toEmail}:`);
            console.log(` ${resetUrl}`);
            console.log('----------------------------------------------------');
            return true;
        }

        try {
            await transporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            console.error('Error sending email:', error);
            throw new Error('No se pudo enviar el correo de recuperación');
        }
    }
};

module.exports = emailService;
