const nodemailer = require('nodemailer');
const asyncHandler = require('express-async-handler');

const sendMail = asyncHandler(async(data,req,res) =>{
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_ID,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    const info = await transporter.sendMail({
        from: '"Modern Mart 👻" <modernmart-noreply@gmail.com>', 
        to: data.to, 
        subject: data.subject, 
        text: data.text, 
        html: data.htm, 
    });      
    console.log("Message sent: %s", info.messageId);
});

module.exports = {sendMail};