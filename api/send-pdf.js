//this is what fullfills the order in the backend side of things.
// We use 'require' because Vercel Serverless Functions use CommonJS module syntax by default.
const { Resend } = require("resend");

// Initialize the Resend client with the API key from our environment variables.
// process.env.RESEND_API_KEY is a secure way to access secrets.
const resend = new Resend(process.env.RESEND_API_KEY);

// This is the main function that Vercel will run.
// 'req' is the incoming request from the frontend, 'res' is the response we send back.
module.exports = async (req, res) => {
  // First, ensure the request is a POST request. Our form sends data via POST.
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  // Ensure we have the API key configured before proceeding.
  if (!process.env.RESEND_API_KEY) {
    console.error("Missing RESEND_API_KEY environment variable");
    return res.status(500).json({ 
      ok: false, 
      error: "Missing RESEND_API_KEY environment variable. Please set it in your environment or .env file." 
    });
  }

  try {
    // Extract the data sent from our frontend form.
    // We use 'req.body' to get the JSON payload.
    const { pdfBase64, filename = "report.pdf", to, subject = "LevelUP Report", html } = req.body || {};

    console.log("Received request:", { 
      hasPdfBase64: !!pdfBase64, 
      filename, 
      to, 
      subject,
      hasHtml: !!html,
      pdfSize: pdfBase64 ? pdfBase64.length : 0
    });

    // Validate that the most important piece of data, the PDF content, exists.
    if (!pdfBase64) {
      return res.status(400).json({ ok: false, error: "Missing pdfBase64 content" });
    }

    // Determine the recipient. Use the 'to' from the request, or fall back
    // to a default recipient from our environment variables.
    const recipient = to || process.env.REPORT_TO;
    if (!recipient) {
      return res.status(400).json({ 
        ok: false, 
        error: "Missing recipient email address. Please provide 'to' in request body or set REPORT_TO environment variable." 
      });
    }

    console.log("Sending email to:", recipient);
    
    // Prevent excessively large files from being processed (e.g., >10MB).
    // Email providers often reject very large attachments.
    const approxBytes = Math.ceil((pdfBase64.length * 3) / 4);
    if (approxBytes > 10 * 1024 * 1024) { // 10 MB
        return res.status(413).json({ ok: false, error: "Attachment too large (>10MB)" });
    }

    // Convert the Base64 string back into a binary buffer, which is what Resend needs.
    const attachmentBuffer = Buffer.from(pdfBase64, "base64");

    // This is the core call to the Resend API.
    const { data, error } = await resend.emails.send({
      from: process.env.MAIL_FROM || "LevelUp Reports <onboarding@resend.dev>", // Friendly default while no custom domain
      to: recipient,
      subject: subject,
      html: html || "<p>Please find your report attached.</p>",
      attachments: [
        {
          filename: filename,
          content: attachmentBuffer,
        },
      ],
    });

    // Handle potential errors from the Resend API call.
    if (error) {
      console.error("Resend API Error:", error);
      return res.status(500).json({ 
        ok: false, 
        error: error.message || "Failed to send email",
        details: error // Include full error details for debugging
      });
    }

    // If successful, send a confirmation response back to the frontend.
    return res.status(200).json({ ok: true, id: data?.id, to: recipient });

  } catch (err) {
    // Handle any other unexpected errors during execution.
    console.error("General send-pdf error:", err);
    return res.status(500).json({ ok: false, error: "An unknown server error occurred" });
  }
};