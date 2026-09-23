import React, { useEffect, useState } from "react";
import axios from "axios";

import { IoChatboxEllipsesOutline } from "react-icons/io5";
import { IoIosContacts } from "react-icons/io";
import { MdGroups } from "react-icons/md";
import { IoCallSharp } from "react-icons/io5";
import { IoMdSettings } from "react-icons/io";
import { IoChatbubbleOutline } from "react-icons/io5";
import { IoLogOutOutline } from "react-icons/io5";

import { useNavigate } from "react-router-dom";

const Sidebar = ({ setActivePage }) => {
  const [name, setName] = useState([]);

  const navigate = useNavigate();

  // =====================================
  // GET PROFILE
  // =====================================

  useEffect(() => {
    async function getProfile() {
      try {
        const res = await axios.get(
          "http://localhost:3000/profile",
          {
            withCredentials: true,
          }
        );

        setName([res.data]);
      } catch (error) {
        console.log(
          "Error getting profile:",
          error
        );
      }
    }

    getProfile();
  }, []);

  // =====================================
  // PROFILE
  // =====================================

  const handleProfile = () => {
    navigate("/profile");
  };

  // =====================================
  // LOGOUT
  // =====================================

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:3000/logout",
        {},
        {
          withCredentials: true,
        }
      );

      console.log("Logout successful");

      navigate("/login");
    } catch (error) {
      console.log(
        "Logout error:",
        error
      );
    }
  };

  return (
    <div
      className="
        flex
        h-full
        w-full
        flex-col
        border
        border-gray-700
        bg-[#16182D]
        p-2
        sm:p-3
        md:p-4
        lg:p-5
      "
    >

      {/* =================================
          LOGO
      ================================= */}

      <div
        className="
          mb-8
          flex
          items-center
          justify-center
          gap-2
          md:mb-16
          lg:mb-20
        "
      >
        <IoChatbubbleOutline
          className="
            h-8
            w-8
            rounded-full
            bg-white
            p-1
            sm:h-9
            sm:w-9
            md:h-10
            md:w-10
          "
        />

        <h4
          className="
            hidden
            text-xl
            font-bold
            text-white
            sm:block
          "
        >
          MyChatApp
        </h4>
      </div>

      {/* =================================
          MENU
      ================================= */}

      <div
        className="
          flex
          flex-col
          items-center
          gap-3
          md:gap-4
        "
      >

        {/* CHATS */}

        <button
          type="button"
          onClick={() =>
            setActivePage("chats")
          }
          className="
            flex
            w-full
            max-w-[130px]
            items-center
            justify-center
            gap-2
            rounded-lg
            border
            border-white
            px-2
            py-2
            text-white
            transition
            duration-300
            hover:bg-white
            hover:text-black
          "
        >
          <IoChatboxEllipsesOutline
            className="
              h-6
              w-6
              flex-shrink-0
            "
          />

          <span className="hidden sm:block">
            Chats
          </span>
        </button>

        {/* CONTACTS */}

        <button
          type="button"
          onClick={() =>
            setActivePage("contacts")
          }
          className="
            flex
            w-full
            max-w-[130px]
            items-center
            justify-center
            gap-2
            rounded-lg
            border
            border-white
            px-2
            py-2
            text-white
            transition
            duration-300
            hover:bg-white
            hover:text-black
          "
        >
          <IoIosContacts
            className="
              h-6
              w-6
              flex-shrink-0
            "
          />

          <span className="hidden sm:block">
            Contacts
          </span>
        </button>

        {/* GROUPS */}

        <button
          type="button"
          className="
            flex
            w-full
            max-w-[130px]
            items-center
            justify-center
            gap-2
            rounded-lg
            border
            border-white
            px-2
            py-2
            text-white
            transition
            duration-300
            hover:bg-white
            hover:text-black
          "
        >
          <MdGroups
            className="
              h-6
              w-6
              flex-shrink-0
            "
          />

          <span className="hidden sm:block">
            Groups
          </span>
        </button>

        {/* CALLS */}

        <button
          type="button"
          className="
            flex
            w-full
            max-w-[130px]
            items-center
            justify-center
            gap-2
            rounded-lg
            border
            border-white
            px-2
            py-2
            text-white
            transition
            duration-300
            hover:bg-white
            hover:text-black
          "
        >
          <IoCallSharp
            className="
              h-6
              w-6
              flex-shrink-0
            "
          />

          <span className="hidden sm:block">
            Calls
          </span>
        </button>

        {/* SETTINGS */}

        <button
          type="button"
          className="
            flex
            w-full
            max-w-[130px]
            items-center
            justify-center
            gap-2
            rounded-lg
            border
            border-white
            px-2
            py-2
            text-white
            transition
            duration-300
            hover:bg-white
            hover:text-black
          "
        >
          <IoMdSettings
            className="
              h-6
              w-6
              flex-shrink-0
            "
          />

          <span className="hidden sm:block">
            Settings
          </span>
        </button>

      </div>

      {/* =================================
          PROFILE + LOGOUT
      ================================= */}

      <div
        className="
          mt-auto
          border-t
          border-gray-600
          pt-4
          md:pt-5
        "
      >

        {/* PROFILE */}

        {name.map((ele, key) => (
          <div
            key={key}
            onClick={handleProfile}
            className="
              flex
              cursor-pointer
              items-center
              justify-center
              gap-2
              rounded-lg
              p-1
              transition
              duration-300
              hover:bg-[#202342]
              sm:justify-start
              sm:gap-3
              sm:p-2
            "
          >

            {/* PROFILE IMAGE */}

            {ele.profileImage ? (
              <img
                src={ele.profileImage}
                alt={ele.name}
                className="
                  h-9
                  w-9
                  flex-shrink-0
                  rounded-full
                  object-cover
                  sm:h-10
                  sm:w-10
                  md:h-11
                  md:w-11
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
                  font-bold
                  text-black
                  sm:h-10
                  sm:w-10
                  md:h-11
                  md:w-11
                "
              >
                {ele.name
                  ?.charAt(0)
                  .toUpperCase()}
              </div>
            )}

            {/* NAME + EMAIL */}

            <div
              className="
                hidden
                min-w-0
                flex-1
                sm:block
              "
            >
              <p
                className="
                  m-0
                  truncate
                  text-sm
                  font-semibold
                  text-white
                  md:text-base
                "
              >
                {ele.name}
              </p>

              <p
                className="
                  m-0
                  truncate
                  text-xs
                  text-gray-400
                  md:text-sm
                "
              >
                {ele.email}
              </p>
            </div>

          </div>
        ))}

        {/* LOGOUT BUTTON */}

        <button
          type="button"
          onClick={handleLogout}
          className="
            mt-3
            flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-lg
            border
            border-red-400
            px-2
            py-2
            text-red-400
            transition
            duration-300
            hover:bg-red-500
            hover:text-white
          "
        >
          <IoLogOutOutline
            className="
              h-5
              w-5
              flex-shrink-0
            "
          />

          <span className="hidden sm:block">
            Logout
          </span>
        </button>

      </div>

    </div>
  );
};

export default Sidebar;