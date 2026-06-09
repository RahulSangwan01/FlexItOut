const nodemailer = require("nodemailer");

exports.sendVerificationEmail = async (newEmail, token) => {
    console.log("Sending email to:", newEmail); // Debugging line

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const verificationLink = `http://localhost:5001/api/email/verify-email-change?token=${token}`;
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: newEmail,
        subject: "Verify Your Email Change",
        text: `Click the link below to verify your new email: \n\n ${verificationLink}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully!"); // Debugging line
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Email sending failed.");
    }
};
