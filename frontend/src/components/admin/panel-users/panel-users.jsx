import "./panel-users.css";
import api from "../../../utils/api";
import React, { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { FaEdit } from "react-icons/fa";
import { MdDeleteSweep } from "react-icons/md";
import { FaCheckSquare } from "react-icons/fa";

export default function UsersPanel() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
//   const [activeID, setActiveId] = useState(null);
//   const [word, setWord] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // Dodanie searchTerm
  const [searchResults, setSearchResults] = useState([]);
//   const [focus, setFocus] = useState("");

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

  return (
    <>
      <div className="users-container">
        <div className="searchbar" tabIndex="0">
          <input
            type="text"
            placeholder="Search by ID / username / email"
            value={searchTerm}
            // onChange={handleSearchChange}
          />
          {searchResults.length > 0 && (
            <div className="search-results">
              <ul>
                {searchResults.map((result, index) => (
                  <li
                    key={result.id}
                    className={index % 2 === 0 ? "even" : "odd"}
                    onClick={() => {
                      //   clickedWord(result.id);
                    }}
                  >
                    <span className="id-span">{result.id}</span>
                    <span className="word-span">{result.word}</span>
                    <span className="level-span">
                      {result.id > 3264 ? "C2" : "B2"}
                    </span>
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
            loader={<h4>Loading...</h4>}
            height={720}
            endMessage={
              <p style={{ textAlign: "center" }}>
                <b>You have seen it all!</b>
              </p>
            }
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
                  <th>moderation</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    id={`user-${user.id}`}
                    // onClick={() => clickedWord(word.id)}
                  >
                    <td>{user.id}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.created_at}</td>
                    <td>{user.last_login}</td>
                    <td>{user.role}</td>
                    <td>
                        <FaEdit/>
                        <MdDeleteSweep/>
                        <FaCheckSquare/>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </InfiniteScroll>
        </div>
      </div>
    </>
  );
}
