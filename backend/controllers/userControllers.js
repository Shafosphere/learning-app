import {
  searchUserById,
  searchUserByEmail,
  searchUserByUsername,
  getUsersWithPagination,
  updateUserInDb,
  deleteUserByID,
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

export const updateUsers = async (req, res) => {
  const { editedRows } = req.body;

  if (!editedRows || Object.keys(editedRows).length === 0) {
    return res.status(400).send("No data to update");
  }

  try {
    // Iteracja po wszystkich użytkownikach i aktualizacja w bazie danych
    const updatePromises = Object.values(editedRows).map(async (user) => {
      await updateUserInDb(user);
    });

    // Czekanie na zakończenie wszystkich operacji aktualizacji
    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: "Users updated successfully.",
    });
  } catch (error) {
    console.error("Error updating users:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing user update.",
    });
  }
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

export const deleteUser = async (req, res) => {
  console.log("deleteUser is Working");
  const userId = req.params.id;
  try {
    await deleteUserByID(userId);
    res.status(200).json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting user:", error); // Dodaj logowanie błędu
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting user.",
    });
  }
};
