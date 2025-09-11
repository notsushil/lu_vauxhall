// this if for the clients' side

import { useState } from "react";

// This is a helper function to read a file and convert it to a Base64 string.
// Base64 is a way to represent binary data (like a PDF) as text.
async function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file); // This reads the file and includes a prefix like "data:application/pdf;base64,"
    reader.onload = () => {
      // We only want the part of the string AFTER the comma.
      const base64String = reader.result.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
}

export default function SendPdfForm() {
  // 'useState' is a React Hook to manage state.
  // 'file' will hold the selected PDF file object.
  const [file, setFile] = useState(null);
  // 'status' will hold user-facing messages (e.g., "Sending...", "Sent!").
  const [status, setStatus] = useState("");
  // 'isSending' will be used to disable the button during submission.
  const [isSending, setIsSending] = useState(false);

  // This function runs when the form is submitted.
  async function onSubmit(e) {
    e.preventDefault(); // Prevents the browser from doing a full page refresh.
    
    if (!file) {
      setStatus("❌ Please select a PDF file first.");
      return;
    }

    setStatus("Sending...");
    setIsSending(true);

    try {
      // Convert the selected file to a Base64 string.
      const pdfBase64 = await toBase64(file);

      // 'fetch' is the browser's built-in way to make API requests.
      // We are "POSTing" our data to our own backend endpoint.
      const res = await fetch("/api/send-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // 'JSON.stringify' converts our JavaScript object into a JSON string for the request.
        body: JSON.stringify({
          pdfBase64,
          filename: file.name,
          subject: `Report: ${file.name}`,
        }),
      });

      // Get the JSON response from our backend.
      const json = await res.json();

      // Check if the request was successful (HTTP status 200-299).
      if (!res.ok) {
        // If not, throw an error to be caught by the 'catch' block.
        // Use the error message from our backend if available.
        throw new Error(json.error || "An unknown error occurred.");
      }
      
      setStatus(`✅ Sent successfully to ${json.to}!`);

    } catch (err) {
      // Display any errors to the user.
      setStatus(`❌ Error: ${err.message}`);
    } finally {
      // This runs whether the submission succeeded or failed.
      setIsSending(false); // Re-enable the button.
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: "12px", maxWidth: "400px" }}>
      <p>Select a PDF file to email.</p>
      <input 
        type="file" 
        accept="application/pdf" 
        onChange={(e) => setFile(e.target.files?.[0] || null)} 
      />
      <button type="submit" disabled={!file || isSending}>
        {isSending ? "Sending..." : "Send PDF"}
      </button>
      {/* Display the status message to the user */}
      {status && <div>{status}</div>}
    </form>
  );
}