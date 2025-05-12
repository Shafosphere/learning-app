import React, { useState, useEffect, useRef, useContext } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { MdEdit } from "react-icons/md";
import { IoIosTrash } from "react-icons/io";
import { FaCheck } from "react-icons/fa6";
import { FaUndoAlt } from "react-icons/fa";
import { PopupContext } from "../../popup/popupcontext";
import ConfirmWindow from "../../confirm/confirm";
import MyButton from "../../button/button";
import api from "../../../utils/api";
import "./panel-users.css";

// Admin panel for managing users with infinite scroll, search, edit, undo, and delete features
export default function UsersPanel() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Search bar state
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // Row editing state
  const [editingRowId, setEditingRowId] = useState(null);
  const [editedRows, setEditedRows] = useState({});

  // Stack of undo operations
  const [undoValues, setUndoValues] = useState([]);

  // Current values being edited
  const [editValues, setEditValues] = useState({
    username: "",
    email: "",
    role: "",
    ban: "",
  });

  const userRef = useRef(null);

  // Confirmation dialog state
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmCallback, setConfirmCallback] = useState(null);

  const { setPopup } = useContext(PopupContext);

  const handleConfirmClose = (result) => {
    if (result && confirmCallback) {
      confirmCallback();
    }
    setConfirmMessage("");
    setConfirmCallback(null);
  };

  // Show confirmation dialog with message and callback
  function showConfirm(message, callback) {
    setConfirmMessage(message);
    setConfirmCallback(() => callback);
  }

  // Fetch users list, paginated
  async function getUsers(pageNumber) {
    try {
      const response = await api.get(`/user/list?page=${pageNumber}&limit=50`);
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  }

  // Initial load
  useEffect(() => {
    const loadInitialUsers = async () => {
      const initialUsers = await getUsers(1);
      setUsers(initialUsers);
      setPage(1);
      setHasMore(initialUsers.length > 0);
    };
    loadInitialUsers();
  }, []);

  // Load more users for infinite scroll
  async function getMoreUsers() {
    const newPage = page + 1;
    const newUsers = await getUsers(newPage);
    if (newUsers.length > 0) {
      setUsers((prev) => [...prev, ...newUsers]);
      setPage(newPage);
    }
    setHasMore(newUsers.length > 0);
  }

  // Send edited rows to server
  async function sendData() {
    if (Object.keys(editedRows).length === 0) {
      console.log("No changes to send");
      return;
    }

    try {
      const response = await api.patch("/user/update", { editedRows });
      if (response.status === 200) {
        setPopup({ message: response.data.message, emotion: "positive" });
        // Apply updates locally and clear edit flags
        const updated = users.map((u) =>
          editedRows[u.id] ? { ...u, ...editedRows[u.id], isEdited: false } : u
        );
        setUsers(updated);
        setEditedRows({});
      }
    } catch (error) {
      setPopup({
        message: error.response?.data?.message || "An error occurred",
        emotion: "negative",
      });
      console.error("Update error:", error.response?.data?.errors || error);
    }
  }

  // Handle search input changes
  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length > 0) {
      try {
        const response = await api.get(`/user/search?query=${value}`);
        setSearchResults(response.data.slice(0, 10)); // Limit to 10 results
      } catch (error) {
        console.error("Error searching users:", error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  // Scroll to selected user in list
  const handleSearchResultClick = (userId) => scrollToUser(userId);

  const scrollToUser = async (userId) => {
    const exists = users.some((u) => u.id === userId);
    if (exists) {
      const el = document.getElementById(`user-${userId}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    } else if (hasMore) {
      await getMoreUsers();
      scrollToUser(userId);
    } else {
      console.log("User not found.");
    }
  };

  // Enable edit mode for a row
  function enableEditMode(user) {
    setEditingRowId(user.id);
    setEditValues({
      username: user.username,
      email: user.email,
      role: user.role,
      ban: user.ban,
    });
  }

  // Track changes in edit inputs
  function handleInputChange(e) {
    const { name, value } = e.target;
    setEditValues((prev) => ({ ...prev, [name]: value }));
  }

  // Confirm edited values and push to undo stack
  function confirm() {
    const user = users.find((u) => u.id === editingRowId);
    if (user) {
      setUndoValues((prev) => [
        ...prev,
        { id: user.id, previousValues: { ...user } },
      ]);
    }

    setUsers((prev) =>
      prev.map((u) =>
        u.id === editingRowId ? { ...u, ...editValues, isEdited: true } : u
      )
    );
    setEditedRows((prev) => ({ ...prev, [editingRowId]: editValues }));
    setEditingRowId(null);
  }

  // Undo last edit
  function undo() {
    const last = undoValues.pop();
    if (!last) return;
    const { id, previousValues } = last;
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, ...previousValues, isEdited: false } : u
      )
    );
    setEditedRows((prev) => {
      const rest = { ...prev };
      delete rest[id];
      return rest;
    });
    setUndoValues([...undoValues]);
  }

  // Delete user with confirmation
  function deleteUser(userId) {
    showConfirm("Are you sure you want to delete this user?", async () => {
      try {
        const response = await api.delete(`/user/delete/${userId}`);
        if (response.status === 200) {
          setUsers((prev) => prev.filter((u) => u.id !== userId));
          setPopup({
            message: "User deleted successfully.",
            emotion: "positive",
          });
        }
      } catch (error) {
        setPopup({ message: "Error deleting user.", emotion: "negative" });
        console.error("Error deleting user:", error);
      }
    });
  }

  return (
    <>
      <div className="users-container">
        {/* Search bar */}
        <div className="searchbar" tabIndex="0">
          <input
            type="text"
            placeholder="Search by ID, username, or email"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchResults.length > 0 && (
            <div className="search-results-users">
              <ul>
                {searchResults.map((result, idx) => (
                  <li
                    key={result.id}
                    className={idx % 2 === 0 ? "even" : "odd"}
                    onClick={() => handleSearchResultClick(result.id)}
                  >
                    <span className="id-span">{result.id}</span>
                    <span className="word-span">{result.username}</span>
                    <span className="word-span">{result.email}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Users table with infinite scroll */}
        <div className="users-table">
          <InfiniteScroll
            dataLength={users.length}
            next={getMoreUsers}
            hasMore={hasMore}
            height={600}
            scrollableTarget="scrollableDiv"
          >
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Created At</th>
                  <th>Last Login</th>
                  <th>Ranking Ban</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    id={`user-${user.id}`}
                    ref={user.id === editingRowId ? userRef : null}
                    className={user.isEdited ? "edited" : ""}
                  >
                    <td>{user.id}</td>
                    <td>
                      {editingRowId === user.id ? (
                        <input
                          type="text"
                          name="username"
                          value={editValues.username}
                          onChange={handleInputChange}
                        />
                      ) : (
                        user.username
                      )}
                    </td>
                    <td>
                      {editingRowId === user.id ? (
                        <input
                          type="email"
                          name="email"
                          value={editValues.email}
                          onChange={handleInputChange}
                        />
                      ) : (
                        user.email
                      )}
                    </td>
                    <td>{user.created_at}</td>
                    <td>{user.last_login}</td>
                    <td>
                      {editingRowId === user.id ? (
                        <select
                          name="ban"
                          value={String(editValues.ban)}
                          onChange={(e) =>
                            setEditValues((prev) => ({
                              ...prev,
                              ban: e.target.value === "true",
                            }))
                          }
                        >
                          <option value="true">true</option>
                          <option value="false">false</option>
                        </select>
                      ) : (
                        String(user.ban)
                      )}
                    </td>
                    <td>
                      {editingRowId === user.id ? (
                        <select
                          name="role"
                          value={editValues.role}
                          onChange={handleInputChange}
                        >
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                      ) : (
                        user.role
                      )}
                    </td>
                    <td className="actions-cell">
                      {editingRowId === user.id ? (
                        <FaCheck className="confirm-user" onClick={confirm} />
                      ) : (
                        <MdEdit onClick={() => enableEditMode(user)} />
                      )}
                      <IoIosTrash onClick={() => deleteUser(user.id)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </InfiniteScroll>
        </div>

        {/* Confirm and undo buttons */}
        <div className="buttons-users-container">
          <MyButton
            message="Confirm Changes"
            color="green"
            onClick={() =>
              showConfirm(
                "Are you sure you want to apply all changes?",
                sendData
              )
            }
          />
          <div onClick={undo} className="undo-user button">
            <FaUndoAlt />
          </div>
        </div>
      </div>

      {/* Confirmation modal */}
      {confirmMessage && (
        <ConfirmWindow message={confirmMessage} onClose={handleConfirmClose} />
      )}
    </>
  );
}
