import React, { useCallback, useEffect, useState } from "react";
import Chatlist from "../Components/Chatlist";
import ChatWindow from "../Components/ChatWindow";
import axios from "axios";
import socket from "./Socket";
import Sidebar from "../Components/Sidebar";
import Contacts from "../Components/Contacts";
import CallManager from "../Components/CallManager";

const Chat = () => {
  const [user, setUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activePage, setActivePage] = useState("chats");

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // =========================
  // GET PROFILE
  // =========================
  useEffect(() => {
    async function getProfile() {
      try {
        const res = await axios.get(
          "http://localhost:3000/profile",
          {
            withCredentials: true,
          }
        );

        console.log("Profile loaded:", res.data);

        setUser(res.data);
      } catch (error) {
        console.log("Profile error:", error);
      }
    }

    getProfile();
  }, []);

  // =========================
  // SOCKET LOGIN
  // =========================
  useEffect(() => {
    if (!user?.email) return;

    const registerUser = () => {
      console.log(
        "Registering socket user:",
        user.email
      );

      socket.emit("login", user.email);
    };

    // Socket already connected
    if (socket.connected) {
      registerUser();
    }

    // Socket connects/reconnects
    socket.on("connect", registerUser);

    return () => {
      socket.off("connect", registerUser);
    };
  }, [user]);

  // =========================
  // SOCKET CONNECT DEBUG
  // =========================
  useEffect(() => {
    const handleConnect = () => {
      console.log(
        "Socket connected:",
        socket.id
      );
    };

    const handleDisconnect = (reason) => {
      console.log(
        "Socket disconnected:",
        reason
      );
    };

    socket.on(
      "connect",
      handleConnect
    );

    socket.on(
      "disconnect",
      handleDisconnect
    );

    return () => {
      socket.off(
        "connect",
        handleConnect
      );

      socket.off(
        "disconnect",
        handleDisconnect
      );
    };
  }, []);

  // =========================
  // NEW MESSAGE
  // =========================
  useEffect(() => {
    const handleReceiveMessage = (newMessage) => {
      console.log(
        "New message received:",
        newMessage
      );

      setRefreshTrigger(
        (prev) => prev + 1
      );
    };

    socket.on(
      "receive-message",
      handleReceiveMessage
    );

    return () => {
      socket.off(
        "receive-message",
        handleReceiveMessage
      );
    };
  }, []);

  // =========================
  // REFRESH CHAT LIST
  // =========================
  const refreshChats = useCallback(() => {
    console.log(
      "Refreshing Chatlist..."
    );

    setRefreshTrigger(
      (prev) => prev + 1
    );
  }, []);

  return (
    <div className="h-screen w-full overflow-hidden bg-white">
      <CallManager user={user} />

      <div
        className="
          grid
          h-full
          w-full
          grid-cols-[64px_minmax(0,1fr)]
          md:grid-cols-[80px_280px_minmax(0,1fr)]
          lg:grid-cols-[200px_300px_minmax(0,1fr)]
        "
      >

        {/* =========================
            SIDEBAR
        ========================== */}
        <div className="h-full min-w-0 overflow-hidden">
          <Sidebar
            setActivePage={setActivePage}
          />
        </div>

        {/* =========================
            CHAT LIST / CONTACTS
        ========================== */}
        <div
          className={`
            h-full
            min-w-0
            overflow-hidden
            border-r
            ${
              selectedUser
                ? "hidden md:block"
                : "block"
            }
          `}
        >
          {activePage === "chats" ? (
            <Chatlist
              setSelectedUser={
                setSelectedUser
              }
              refreshTrigger={
                refreshTrigger
              }
            />
          ) : (
            <Contacts
              setSelectedUser={
                setSelectedUser
              }
            />
          )}
        </div>

        {/* =========================
            CHAT WINDOW
        ========================== */}
        <div
          className={`
            h-full
            min-w-0
            overflow-hidden
            ${
              selectedUser
                ? "block"
                : "hidden md:block"
            }
          `}
        >
          <ChatWindow
            user={user}
            selectedUser={selectedUser}
            setSelectedUser={
              setSelectedUser
            }
            onMessageSent={
              refreshChats
            }
            onMessagesRead={
              refreshChats
            }
          />
        </div>

      </div>
    </div>
  );
};

export default Chat;