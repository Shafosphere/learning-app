import "./panel-users.css";
import api from "../../../utils/api";
import React, { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { MdDeleteSweep, MdEditNote } from "react-icons/md";
import { MdEdit } from "react-icons/md";
import { FaTrash } from "react-icons/fa";
import { IoIosTrash } from "react-icons/io";
import { FaCheck } from "react-icons/fa6";

// import { FaCheckSquare } from "react-icons/fa";

export default function UsersPanel() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // Dodanie searchTerm
  const [searchResults, setSearchResults] = useState([]);
  const [editingRowId, setEditingRowId] = useState(null);
  const [editValues, setEditValues] = useState({
    username: "",
    email: "",
    role: "",
  });

  const [editedRows, setEditedRows] = useState({});


  async function getUsers(page) {
    try {
      const response = await api.get(`/users?page=${page}&limit=50`);
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  }

  useEffect(() => {
    const loadInitialUsers = async () => {
      const initialUsers = await getUsers(1);
      setUsers(initialUsers);
      setPage(1);
      setHasMore(initialUsers.length > 0);
    };

    loadInitialUsers();
  }, []);

  async function getMoreUsers() {
    const newPage = page + 1;
    const newUsers = await getUsers(newPage);
    if (newUsers.length > 0) {
      setUsers((prevUsers) => [...prevUsers, ...newUsers]);
      setPage(newPage);
    }
    setHasMore(newUsers.length > 0);
  }

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length > 0) {
      try {
        const response = await api.get(`/search-user?query=${value}`);
        if (response.data.length > 0) {
          setSearchResults(response.data.slice(0, 10)); // Limitowanie wyników do 10
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error("Error searching words:", error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  function enableEditMode(user) {
    setEditingRowId(user.id);
    setEditValues({
      username: user.username,
      email: user.email,
      role: user.role,
    });
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setEditValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  }

  function confirm() {
    setUsers((prevUsers) =>
      prevUsers.map((user) => {
        if (user.id === editingRowId) {
          const updatedUser = { ...user, ...editValues };
          setEditedRows((prevEditedRows) => ({
            ...prevEditedRows,
            [user.id]: updatedUser,
          }));
          return { ...updatedUser, isEdited: true };
        }
        return user;
      })
    );
    setEditingRowId(null);
  }
  

  return (
    <>
      <div className="users-container">
        <div className="searchbar" tabIndex="0">
          <input
            type="text"
            placeholder="Search by ID / username / email"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchResults.length > 0 && (
            <div className="search-results-users">
              <ul>
                {searchResults.map((result, index) => (
                  <li
                    key={result.id}
                    className={index % 2 === 0 ? "even" : "odd"}
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
                  <th>id</th>
                  <th>username</th>
                  <th>email</th>
                  <th>created time</th>
                  <th>last login</th>
                  <th>role</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className={user.isEdited ? "edited" : ""}>
                    <td>{user.id}</td>
                    <td className="username">
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
                    <td className="email">
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
                    <td className="role">
                      {editingRowId === user.id ? (
                        <select
                          id="reportType"
                          name="role"
                          value={editValues.role}
                          onChange={handleInputChange} // Przekazujesz event, nie wartość
                        > 
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                      ) : (
                        user.role
                      )}
                    </td>
                    <td>
                      <div className="user-icons">
                        {editingRowId === user.id ? (
                          <>
                            <FaCheck  onClick={()=>confirm()}/>
                          </>
                        ) : (
                          <MdEdit onClick={() => enableEditMode(user)} />
                        )}
                        <IoIosTrash />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </InfiniteScroll>
        </div>
        <div className="edit-user button">send changes</div>
      </div>
    </>
  );
}
