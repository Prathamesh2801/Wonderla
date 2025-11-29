// api/user.js
import axios from "axios";
import { BASE_URL } from "../../config";

const URL = BASE_URL + "/user.php";

/**
 * Add a user
 * @param {Object} data
 * @param {string} data.Name          // required
 * @param {number|string} data.Score  // required (float)
 * @param {string} [data.Email]       // optional
 * @param {string} [data.Number]      // optional
 * @param {string} [data.Pincode]     // optional
 * @param {string} [data.Company_ID]  // optional
 */
export async function addUser({
  Name,
  Score,
  Email,
  Number: phoneNumber,   // 👈 rename here
  Pincode,
  Company_ID,
} = {}) {
  // ---------- Frontend validation for required fields ----------
  if (!Name || Name.trim() === "") {
    throw new Error("Name is required");
  }

  if (Score === undefined || Score === null || Score === "") {
    throw new Error("Score is required");
  }

  // Now this uses the global Number() correctly
  const scoreNumber = Number(Score);
  if (Number.isNaN(scoreNumber)) {
    throw new Error("Score must be a valid number");
  }

  // ---------- Build form-data body ----------
  const formData = new FormData();

  formData.append("Name", Name.trim());
  formData.append("Score", scoreNumber);

  if (Email) formData.append("Email", Email);
  if (phoneNumber) formData.append("Number", phoneNumber);   // 👈 use renamed var
  if (Pincode) formData.append("Pincode", Pincode);
  if (Company_ID) formData.append("Company_ID", Company_ID);

  try {
    const response = await axios.post(URL, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      validateStatus: (status) => status >= 200 && status < 400,
    });

    return response.data;
  } catch (error) {
    console.error("Error adding user:", error);
    throw error;
  }
}
