import axios from "axios";
import { BASE_URL } from "../../config";

const URL = BASE_URL + "/user.php";

export async function fetchAll(params = {}) {
  try {
    const response = await axios.get(URL, {
      params,
      validateStatus: (status) => {
        return status >= 200 && status < 400;
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}

export async function addUser({
  Name,
  Score,
  Email,
  Number: phoneNumber,
  Pincode,
  Company_ID,
} = {}) {
  if (!Name || Name.trim() === "") {
    throw new Error("Name is required");
  }

  if (Score === undefined || Score === null || Score === "") {
    throw new Error("Score is required");
  }

  const scoreNumber = Number(Score);
  if (Number.isNaN(scoreNumber)) {
    throw new Error("Score must be a valid number");
  }

  const formData = new FormData();

  formData.append("Name", Name.trim());
  formData.append("Score", scoreNumber);

  if (Email) formData.append("Email", Email);
  if (phoneNumber) formData.append("Number", phoneNumber);
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

export async function deleteUser(User_ID) {
  if (!User_ID) {
    throw new Error("User_ID is required to delete user");
  }

  try {
    const response = await axios.delete(URL, {
      params: { User_ID },
      validateStatus: (status) => status >= 200 && status < 400,
    });

    return response.data;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}
