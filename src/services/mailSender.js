
import nodeMailer from "nodemailer"

export const sendMailService = async({to,subject,message,attaches=[]}={})=>{
    const transporter = nodeMailer.createTransport({
        host:"localhost",
        port:465,     //587
        secure:true,  //false
        service:"gmail",
        auth:{
            user:"aliovich711@gmail.com",
            pass:"sgaj cggx xzxn pznz"
        } ,
        // tls:{
        //     rejectUnauthorized:false,
        // }
    })

    const emailInfo = transporter.sendMail({
        from:'"3amak Ali" <aliovich711@gmail.com>',
        to: to ? to : "",
        subject : subject? subject : "test",
        html : message? message : "",
        attachments : attaches 
    })

}