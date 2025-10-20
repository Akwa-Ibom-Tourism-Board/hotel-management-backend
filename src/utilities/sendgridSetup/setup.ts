import sendgridMail from '@sendgrid/mail';
import sendgridClient from '@sendgrid/client';

sendgridMail.setApiKey(process.env.SENDGRID_API_KEY!)
sendgridClient.setApiKey(process.env.SENDGRID_API_KEY!)


export default {sendgridMail, sendgridClient};