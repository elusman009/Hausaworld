// lib/email.js
import sgMail from "@sendgrid/mail";
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Send download email (example)
 */
export async function sendDownloadEmail(to, movieTitle, downloadUrl) {
  const msg = {
    to,
    from: "no-reply@hausaworld.example", // verified sender
    subject: `Your download link for ${movieTitle}`,
    text: `Thanks for your purchase. Download here: ${downloadUrl}`,
    html: `<p>Thanks for your purchase. Click <a href="${downloadUrl}">here to download ${movieTitle}</a>. The link expires in 1 hour.</p>`
  };
  return sgMail.send(msg);
}
