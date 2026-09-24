import React, {
  useEffect,
  useState,
} from "react";
import api from "../api/axios";
import socket from "../Pages/Socket";

const ChatWindow = ({
  user,
  selectedUser,
  setSelectedUser,
  onMessageSent,
  onMessagesRead,
}) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  // =====================================
  // LOAD MESSAGES
  // =====================================

  useEffect(() => {
    if (!selectedUser?.email) {
      setMessages([]);
      return;
    }

    async function getMessages() {
      try {
        const res = await api.get(
          `/messages/${encodeURIComponent(
            selectedUser.email
          )}`
        );

        console.log(
          "Messages from MongoDB:",
          res.data
        );

        setMessages(res.data);

        // Mark messages as read
        const readRes = await api.put(
          `/messages/${encodeURIComponent(
            selectedUser.email
          )}/read`,
          {}
        );

        console.log(
          "Read response:",
          readRes.data
        );

        onMessagesRead();
      } catch (error) {
        console.log(
          "Error getting messages:",
          error
        );
      }
    }

    getMessages();
  }, [
    selectedUser,
    onMessagesRead,
  ]);

  // =====================================
  // RECEIVE MESSAGE
  // =====================================

  useEffect(() => {
    const receiveMessage = (newMessage) => {
      console.log(
        "New message received:",
        newMessage
      );

      if (
        selectedUser &&
        (
          newMessage.sender ===
            selectedUser.email ||
          newMessage.receiver ===
            selectedUser.email
        )
      ) {
        setMessages((prevMessages) => [
          ...prevMessages,
          newMessage,
        ]);

        // If message is from selected user,
        // mark it as read immediately
        if (
          newMessage.sender ===
            selectedUser.email &&
          newMessage.receiver ===
            user?.email
        ) {
          api
            .put(
              `/messages/${encodeURIComponent(
                selectedUser.email
              )}/read`,
              {}
            )
            .then(() => {
              onMessagesRead();
            })
            .catch((error) => {
              console.log(
                "Read error:",
                error
              );
            });
        }
      } else {
        // Message belongs to another chat
        onMessagesRead();
      }
    };

    socket.on(
      "receive-message",
      receiveMessage
    );

    return () => {
      socket.off(
        "receive-message",
        receiveMessage
      );
    };
  }, [
    selectedUser,
    user,
    onMessagesRead,
  ]);

  // =====================================
  // MESSAGE SENT
  // =====================================

  useEffect(() => {
    const messageSent = (savedMessage) => {
      console.log(
        "Message saved:",
        savedMessage
      );

      // Only add if this message belongs
      // to the currently selected chat
      if (
        selectedUser &&
        (
          savedMessage.sender ===
            selectedUser.email ||
          savedMessage.receiver ===
            selectedUser.email
        )
      ) {
        setMessages((prevMessages) => [
          ...prevMessages,
          savedMessage,
        ]);
      }

      onMessageSent();
    };

    socket.on(
      "message-sent",
      messageSent
    );

    return () => {
      socket.off(
        "message-sent",
        messageSent
      );
    };
  }, [
    selectedUser,
    onMessageSent,
  ]);

  // =====================================
  // SEND MESSAGE
  // =====================================

  const sendMessage = () => {
    if (!message.trim()) {
      return;
    }

    if (
      !user?.email ||
      !selectedUser?.email
    ) {
      return;
    }

    const newMessage = {
      sender: user.email,
      receiver: selectedUser.email,
      text: message.trim(),
    };

    console.log(
      "Sending message:",
      newMessage
    );

    socket.emit(
      "send-message",
      newMessage
    );

    setMessage("");
  };

  // =====================================
  // ENTER KEY
  // =====================================

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  // =====================================
  // START AUDIO CALL
  // =====================================

  const handleStartCall = () => {
    if (!selectedUser?.email) {
      return;
    }

    if (window.startAudioCall) {
      window.startAudioCall(
        selectedUser
      );
    } else {
      console.log(
        "CallManager is not ready"
      );
    }
  };

  // =====================================
  // NO CHAT SELECTED
  // =====================================

  if (!selectedUser) {
    return (
      <div
        className="
          flex
          h-full
          w-full
          items-center
          justify-center
          bg-gray-100
          px-4
        "
      >
        <div className="text-center text-gray-500">
          <h2
            className="
              text-lg
              font-semibold
              sm:text-xl
            "
          >
            Select a contact
          </h2>

          <p
            className="
              mt-2
              text-sm
              sm:text-base
            "
          >
            Choose someone from your
            contacts to start chatting.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="
        flex
        h-full
        w-full
        min-w-0
        flex-col
        overflow-hidden
        bg-white
      "
    >

      {/* =================================
          CHAT HEADER
      ================================= */}

      <div
        className="
          flex
          flex-shrink-0
          items-center
          justify-between
          gap-2
          border-b
          bg-white
          px-3
          py-3
          sm:px-4
          sm:py-4
        "
      >

        {/* USER INFORMATION */}

        <div
          className="
            flex
            min-w-0
            items-center
            gap-2
            sm:gap-3
          "
        >

          {/* MOBILE BACK BUTTON */}

          <button
            type="button"
            onClick={() =>
              setSelectedUser(null)
            }
            className="
              flex
              h-9
              w-9
              flex-shrink-0
              items-center
              justify-center
              rounded-full
              text-xl
              text-gray-600
              transition
              hover:bg-gray-100
              hover:text-black
              md:hidden
            "
            aria-label="Back to chats"
          >
            ←
          </button>

          {/* PROFILE IMAGE */}

          {selectedUser.profileImage ? (
            <img
              src={
                selectedUser.profileImage
              }
              alt={selectedUser.name}
              className="
                h-9
                w-9
                flex-shrink-0
                rounded-full
                object-cover
                sm:h-11
                sm:w-11
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
                sm:h-11
                sm:w-11
              "
            >
              {selectedUser.name
                ?.charAt(0)
                .toUpperCase()}
            </div>
          )}

          {/* NAME + EMAIL */}

          <div className="min-w-0">
            <p
              className="
                truncate
                text-sm
                font-semibold
                text-gray-900
                sm:text-base
              "
            >
              {selectedUser.name}
            </p>

            <p
              className="
                max-w-[45vw]
                truncate
                text-xs
                text-gray-500
                sm:max-w-none
                sm:text-sm
              "
            >
              {selectedUser.email}
            </p>
          </div>
        </div>

        {/* CALL + CLOSE BUTTONS */}

        <div className="flex items-center gap-1">

          {/* AUDIO CALL */}

          <button
            type="button"
            onClick={handleStartCall}
            className="
              flex
              h-9
              w-9
              flex-shrink-0
              items-center
              justify-center
              rounded-full
              text-lg
              text-green-600
              transition
              hover:bg-green-50
            "
            aria-label="Start audio call"
            title="Audio call"
          >
            📞
          </button>

          {/* CLOSE CHAT */}

          <button
            type="button"
            onClick={() =>
              setSelectedUser(null)
            }
            className="
              flex
              h-9
              w-9
              flex-shrink-0
              items-center
              justify-center
              rounded-full
              text-lg
              text-gray-500
              transition
              hover:bg-gray-100
              hover:text-black
            "
            aria-label="Close chat"
          >
            ✕
          </button>

        </div>
      </div>

      {/* =================================
          MESSAGES
      ================================= */}

      <div
        className="
          flex-1
          min-h-0
          space-y-2
          overflow-y-auto
          p-3
          sm:space-y-3
          sm:p-4
        "
      >

        {messages.length === 0 ? (
          <div
            className="
              flex
              h-full
              items-center
              justify-center
              text-center
              text-sm
              text-gray-400
              sm:text-base
            "
          >
            No messages yet
          </div>
        ) : (
          messages.map((msg) => {

            const isMyMessage =
              msg.sender === user?.email;

            return (
              <div
                key={msg._id}
                className={`flex ${
                  isMyMessage
                    ? "justify-end"
                    : "justify-start"
                }`}
              >

                <div
                  className={`
                    max-w-[85%]
                    break-words
                    rounded-lg
                    px-3
                    py-2
                    text-sm
                    sm:max-w-[70%]
                    sm:px-4
                    sm:text-base
                    ${
                      isMyMessage
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-black"
                    }
                  `}
                >

                  {/* MESSAGE TEXT */}

                  <p
                    className="
                      whitespace-pre-wrap
                      break-words
                    "
                  >
                    {msg.text}
                  </p>

                  {/* TIME + READ STATUS */}

                  <div
                    className="
                      mt-1
                      flex
                      items-center
                      justify-end
                      gap-1
                    "
                  >

                    <span
                      className={`
                        text-[10px]
                        sm:text-xs
                        ${
                          isMyMessage
                            ? "text-blue-100"
                            : "text-gray-500"
                        }
                      `}
                    >
                      {msg.createdAt
                        ? new Date(
                            msg.createdAt
                          ).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                        : ""}
                    </span>

                    {/* READ / SENT */}

                    {isMyMessage && (
                      <span
                        className={`
                          text-[10px]
                          sm:text-xs
                          ${
                            msg.read
                              ? "text-blue-100"
                              : "text-gray-300"
                          }
                        `}
                      >
                        {msg.read
                          ? "✓✓"
                          : "✓"}
                      </span>
                    )}

                  </div>
                </div>

              </div>
            );
          })
        )}

      </div>

      {/* =================================
          MESSAGE INPUT
      ================================= */}

      <div
        className="
          flex
          flex-shrink-0
          items-center
          gap-2
          border-t
          bg-white
          p-2
          sm:p-4
        "
      >

        <input
          type="text"
          value={message}
          onChange={(e) =>
            setMessage(e.target.value)
          }
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="
            min-w-0
            flex-1
            rounded-lg
            border
            px-3
            py-2
            text-sm
            outline-none
            transition
            focus:border-blue-400
            focus:ring-2
            focus:ring-blue-200
            sm:px-4
            sm:text-base
          "
        />

        <button
          type="button"
          onClick={sendMessage}
          className="
            flex-shrink-0
            rounded-lg
            bg-blue-500
            px-3
            py-2
            text-sm
            font-medium
            text-white
            transition
            hover:bg-blue-600
            sm:px-5
            sm:text-base
          "
        >
          Send
        </button>

      </div>

    </div>
  );
};

export default ChatWindow;