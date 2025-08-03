const nodeMailer = require('nodemailer');

exports.sendOTP = async (email, otp) => {
    const transporter = nodeMailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: `OTP Service <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your OTP Code',
        html: `<p>Your OTP is <b>${otp}</b>. It will expire in 5 minutes.</p>`
    };

    await transporter.sendMail(mailOptions);
};

exports.sendPasswordResetOTP = async (email, otp) => {
    const transporter = nodeMailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: `Password Reset Service <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Password Reset OTP',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Password Reset Request</h2>
                <p>You have requested to reset your password. Please use the following OTP to proceed:</p>
                <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
                    <h3 style="color: #007bff; margin: 0; font-size: 24px; letter-spacing: 3px;">${otp}</h3>
                </div>
                <p><strong>This OTP will expire in 5 minutes.</strong></p>
                <p>If you didn't request this password reset, please ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #666;">This is an automated message, please do not reply.</p>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
};
