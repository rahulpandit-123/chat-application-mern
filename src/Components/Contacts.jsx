import React, { useEffect, useState } from "react";
import api from "../api/axios";

const Contacts = ({ setSelectedUser }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function getUsers() {
      try {
        const res = await api.get("/users");

        setUsers(res.data);
      } catch (error) {
        console.log(
          "Error getting users:",
          error
        );
      }
    }

    getUsers();
  }, []);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-white">

      {/* =================================
          HEADER
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
        <h1
          className="
            text-lg
            font-bold
            sm:text-xl
            lg:text-2xl
          "
        >
          Contacts
        </h1>
      </div>

      {/* =================================
          CONTACT LIST
      ================================= */}

      <div className="min-h-0 flex-1 overflow-y-auto">

        {users.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">
            No contacts found
          </p>
        ) : (
          users.map((user) => (
            <div
              key={user._id}
              onClick={() =>
                setSelectedUser(user)
              }
              className="
                flex
                min-w-0
                cursor-pointer
                items-center
                gap-2
                border-b
                px-3
                py-3
                transition
                hover:bg-gray-100
                sm:gap-3
                sm:px-4
                sm:py-4
                lg:gap-4
                lg:px-5
              "
            >

              {/* =========================
                  PROFILE IMAGE
              ========================= */}

              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="
                    h-10
                    w-10
                    flex-shrink-0
                    rounded-full
                    object-cover
                    sm:h-11
                    sm:w-11
                    lg:h-12
                    lg:w-12
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
                    sm:h-11
                    sm:w-11
                    lg:h-12
                    lg:w-12
                  "
                >
                  {user.name
                    ?.charAt(0)
                    .toUpperCase()}
                </div>
              )}

              {/* =========================
                  USER INFORMATION
              ========================= */}

              <div className="min-w-0 flex-1">

                <p
                  className="
                    truncate
                    text-sm
                    font-semibold
                    text-gray-900
                    sm:text-base
                  "
                >
                  {user.name}
                </p>

                <p
                  className="
                    truncate
                    text-xs
                    text-gray-500
                    sm:text-sm
                  "
                >
                  {user.email}
                </p>

              </div>
            </div>
          ))
        )}

      </div>
    </div>
  );
};

export default Contacts;