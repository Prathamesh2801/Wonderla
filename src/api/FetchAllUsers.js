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
