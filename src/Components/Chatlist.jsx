import React, { useEffect, useState } from "react";
import api from "../api/axios";

const Chatlist = ({
  setSelectedUser,
  refreshTrigger,
}) => {
  const [searchName, setSearchName] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [chats, setChats] = useState([]);

  // =====================================
  // GET CHATS
  // =====================================

  useEffect(() => {
    async function getChats() {
      try {
        const res = await api.get("/chats");

        console.log("Chats:", res.data);

        setChats(res.data);
      } catch (error) {
        console.log(
          "Chat list error:",
          error
        );
      }
    }

    getChats();
  }, [refreshTrigger]);

  // =====================================
  // SEARCH USERS
  // =====================================

  useEffect(() => {
    async function searchUsers() {
      if (!searchName.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        const res = await api.get(
          `/search-user?name=${encodeURIComponent(
            searchName.trim()
          )}`
        );

        setSearchResults(res.data);
      } catch (error) {
        console.log(
          "Search error:",
          error
        );
      }
    }

    searchUsers();
  }, [searchName]);

  // =====================================
  // SELECT USER
  // =====================================

  const selectUser = (user) => {
    setSelectedUser(user);

    setSearchName("");
    setSearchResults([]);
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-white">

      {/* =================================
          HEADER / SEARCH
      ================================= */}

      <div
        className="
          flex-shrink-0
          border-b
          p-3
          sm:p-4
          lg:p-5
        "
      >
        <h2
          className="
            text-lg
            font-bold
            sm:text-xl
          "
        >
          Chats
        </h2>

        <input
          type="text"
          placeholder="Search users..."
          value={searchName}
          onChange={(e) =>
            setSearchName(e.target.value)
          }
          className="
            mt-3
            w-full
            rounded-lg
            border
            px-3
            py-2
            text-sm
            outline-none
            transition
            focus:border-blue-500
            focus:ring-2
            focus:ring-blue-200
            sm:mt-4
            sm:px-4
          "
        />
      </div>

      {/* =================================
          SEARCH RESULTS
      ================================= */}

      {searchName.trim() && (
        <div className="min-h-0 flex-1 overflow-y-auto">

          {searchResults.length === 0 ? (
            <p
              className="
                p-3
                text-sm
                text-gray-500
                sm:p-4
              "
            >
              No users found
            </p>
          ) : (
            searchResults.map((user) => (
              <div
                key={user.email}
                onClick={() =>
                  selectUser(user)
                }
                className="
                  cursor-pointer
                  border-b
                  px-3
                  py-3
                  transition
                  hover:bg-black
                  hover:text-white
                  sm:px-4
                  sm:py-4
                "
              >
                <div className="flex items-center gap-2 sm:gap-3">

                  {/* PROFILE IMAGE */}

                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="
                        h-9
                        w-9
                        flex-shrink-0
                        rounded-full
                        object-cover
                        sm:h-10
                        sm:w-10
                      "
                    />
                  ) : (
                    <div
                      className="
                        flex
                        h-9
                        w-9
                        flex-shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-gray-300
                        text-sm
                        font-bold
                        sm:h-10
                        sm:w-10
                      "
                    >
                      {user.name
                        ?.charAt(0)
                        .toUpperCase()}
                    </div>
                  )}

                  {/* USER INFORMATION */}

                  <div className="min-w-0 flex-1">

                    <strong className="block truncate text-sm sm:text-base">
                      {user.name}
                    </strong>

                    <p className="truncate text-xs text-gray-400 sm:text-sm">
                      {user.email}
                    </p>

                  </div>
                </div>
              </div>
            ))
          )}

        </div>
      )}

      {/* =================================
          NORMAL CHAT LIST
      ================================= */}

      {!searchName.trim() && (
        <div className="min-h-0 flex-1 overflow-y-auto">

          {chats.length === 0 ? (
            <p
              className="
                p-3
                text-sm
                text-gray-500
                sm:p-4
              "
            >
              No conversations yet
            </p>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.email}
                onClick={() =>
                  selectUser(chat)
                }
                className="
                  cursor-pointer
                  border-b
                  px-3
                  py-3
                  transition
                  hover:bg-black
                  hover:text-white
                  sm:px-4
                  sm:py-4
                "
              >
                <div className="flex items-center gap-2 sm:gap-3">

                  {/* PROFILE IMAGE */}

                  {chat.profileImage ? (
                    <img
                      src={chat.profileImage}
                      alt={chat.name}
                      className="
                        h-10
                        w-10
                        flex-shrink-0
                        rounded-full
                        object-cover
                        sm:h-12
                        sm:w-12
                      "
                    />
                  ) : (
                    <div
                      className="
                        flex
                        h-10
                        w-10
                        flex-shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-gray-300
                        text-sm
                        font-bold
                        sm:h-12
                        sm:w-12
                      "
                    >
                      {chat.name
                        ?.charAt(0)
                        .toUpperCase()}
                    </div>
                  )}

                  {/* CHAT INFORMATION */}

                  <div className="min-w-0 flex-1">

                    {/* NAME + TIME */}

                    <div className="flex min-w-0 items-center justify-between gap-2">

                      <strong
                        className="
                          min-w-0
                          truncate
                          text-sm
                          sm:text-base
                        "
                      >
                        {chat.name}
                      </strong>

                      <span
                        className="
                          flex-shrink-0
                          whitespace-nowrap
                          text-[10px]
                          text-gray-400
                          sm:text-xs
                        "
                      >
                        {chat.timestamp
                          ? new Date(
                              chat.timestamp
                            ).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
                          : ""}
                      </span>

                    </div>

                    {/* LAST MESSAGE + UNREAD */}

                    <div className="mt-1 flex min-w-0 items-center justify-between gap-2">

                      <p
                        className="
                          min-w-0
                          truncate
                          text-xs
                          text-gray-400
                          sm:text-sm
                        "
                      >
                        {chat.lastMessage}
                      </p>

                      {/* UNREAD COUNT */}

                      {chat.unreadCount > 0 && (
                        <span
                          className="
                            flex
                            h-5
                            min-w-5
                            flex-shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-green-500
                            px-1
                            text-[10px]
                            font-bold
                            text-white
                            sm:text-xs
                          "
                        >
                          {chat.unreadCount}
                        </span>
                      )}

                    </div>

                  </div>
                </div>
              </div>
            ))
          )}

        </div>
      )}
    </div>
  );
};

export default Chatlist;