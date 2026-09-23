import React from "react";

const CallModal = ({
  type,
  caller,
  selectedUser,
  onAccept,
  onReject,
  onEnd,
  isMuted,
  onMute,
}) => {
  const person = caller || selectedUser;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
        
        {/* Profile */}
        {person?.profileImage ? (
          <img
            src={person.profileImage}
            alt={person.name}
            className="mx-auto h-24 w-24 rounded-full object-cover"
          />
        ) : (
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gray-300 text-3xl font-bold">
            {person?.name?.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Name */}
        <h2 className="mt-4 text-xl font-bold text-gray-900">
          {person?.name || "Unknown User"}
        </h2>

        {/* Incoming */}
        {type === "incoming" && (
          <>
            <p className="mt-2 text-gray-500">
              Incoming audio call...
            </p>

            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={onReject}
                className="rounded-full bg-red-500 px-6 py-3 font-semibold text-white transition hover:bg-red-600"
              >
                Reject
              </button>

              <button
                onClick={onAccept}
                className="rounded-full bg-green-500 px-6 py-3 font-semibold text-white transition hover:bg-green-600"
              >
                Accept
              </button>
            </div>
          </>
        )}

        {/* Calling */}
        {type === "calling" && (
          <>
            <p className="mt-2 text-gray-500">
              Calling...
            </p>

            <button
              onClick={onEnd}
              className="mt-6 rounded-full bg-red-500 px-6 py-3 font-semibold text-white transition hover:bg-red-600"
            >
              End Call
            </button>
          </>
        )}

        {/* Connected */}
        {type === "connected" && (
          <>
            <p className="mt-2 text-green-600">
              Call connected
            </p>

            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={onMute}
                className="rounded-full bg-gray-800 px-5 py-3 font-semibold text-white"
              >
                {isMuted ? "🔊 Unmute" : "🔇 Mute"}
              </button>

              <button
                onClick={onEnd}
                className="rounded-full bg-red-500 px-6 py-3 font-semibold text-white"
              >
                End
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CallModal;