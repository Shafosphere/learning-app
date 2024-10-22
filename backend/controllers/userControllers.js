import {
  searchUserById,
  searchUserByEmail,
  searchUserByUsername,
  getUsersWithPagination,
} from "../models/userModel.js";

export const getUsersList = async (req, res) => {
  const { page = 1, limit = 50 } = req.query;

  try {
    const offset = (page - 1) * limit;
    console.log(
      `Fetching users for page: ${page}, limit: ${limit}, offset: ${offset}`
    );

    const users = await getUsersWithPagination(parseInt(limit), offset);

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Server Error");
  }
};

export const updateUserById = async (user) => {
  const { id, username, email, role } = user;

  // Na razie jest to tylko szkielet funkcji - logika zostanie dodana później
  // Przykładowe zapytanie mogłoby wyglądać tak:
  /*
    await pool.query(
      "UPDATE users SET username = $1, email = $2, role = $3 WHERE id = $4",
      [username, email, role, id]
    );
    */
  console.log(
    `Updating user with id: ${id}, username: ${username}, email: ${email}, role: ${role}`
  );
};

export const searchUsers = async (req, res) => {
  const { query } = req.query;

  try {
    let result;

    if (!isNaN(query)) {
      // Jeśli query jest liczbą (wyszukiwanie po ID)
      result = await searchUserById(parseInt(query));
    } else if (query.includes("@")) {
      // Jeśli query jest emailem
      result = await searchUserByEmail(query);
    } else {
      // Jeśli query jest nazwą użytkownika (username)
      result = await searchUserByUsername(query);
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "No records found" });
    }

    console.log("Search result:", result);
    res.json(result);
  } catch (error) {
    console.error("Error during search:", error);
    res.status(500).send("Server Error");
  }
};