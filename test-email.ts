import { sendEmail } from "./lib/email";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  console.log("Testing email with user:", process.env.EMAIL_USER);
  try {
    await sendEmail("abhishekp@theargusconsulting.com", "Test Email", "This is a test email");
    console.log("Email sent successfully!");
  } catch (err) {
    console.error("Failed:", err);
  }
}
main();
