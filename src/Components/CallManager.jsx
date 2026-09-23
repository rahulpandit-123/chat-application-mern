import React, {
  useEffect,
  useRef,
  useState,
} from "react";
import axios from "axios";
import socket from "../Pages/Socket";
import CallModal from "./CallModal";

const CallManager = ({ user }) => {
  // =====================================
  // CALL STATES
  // =====================================

  const [callType, setCallType] = useState(null);

  const [incomingCaller, setIncomingCaller] =
    useState(null);

  const [incomingOffer, setIncomingOffer] =
    useState(null);

  const [callReceiver, setCallReceiver] =
    useState(null);

  const [isMuted, setIsMuted] =
    useState(false);

  // =====================================
  // WEBRTC REFS
  // =====================================

  const peerConnectionRef =
    useRef(null);

  const localStreamRef =
    useRef(null);

  const remoteAudioRef =
    useRef(null);

  const iceCandidatesRef =
    useRef([]);

  const remoteDescriptionSetRef =
    useRef(false);

  // =====================================
  // GET USER DETAILS
  // =====================================

  const getUserDetails = async (email) => {
    try {
      const res = await axios.get(
        "http://localhost:3000/users",
        {
          withCredentials: true,
        }
      );

      const foundUser =
        res.data.find(
          (item) =>
            item.email === email
        );

      return (
        foundUser || {
          name: email,
          email: email,
          profileImage: "",
        }
      );
    } catch (error) {
      console.log(
        "Get caller details error:",
        error
      );

      return {
        name: email,
        email: email,
        profileImage: "",
      };
    }
  };

  // =====================================
  // CREATE PEER CONNECTION
  // =====================================

  const createPeerConnection = (
    receiverEmail
  ) => {
    console.log(
      "Creating WebRTC connection with:",
      receiverEmail
    );

    const peer =
      new RTCPeerConnection({
        iceServers: [
          {
            urls:
              "stun:stun.l.google.com:19302",
          },
        ],
      });

    peerConnectionRef.current =
      peer;

    // ===================================
    // ICE CANDIDATE
    // ===================================

    peer.onicecandidate = (
      event
    ) => {
      if (!event.candidate) {
        return;
      }

      console.log(
        "Sending ICE candidate to:",
        receiverEmail
      );

      socket.emit(
        "ice-candidate",
        {
          receiver:
            receiverEmail,
          candidate:
            event.candidate,
        }
      );
    };

    // ===================================
    // REMOTE AUDIO
    // ===================================

    peer.ontrack = (
      event
    ) => {
      console.log(
        "🎧 Remote audio received"
      );

      if (
        remoteAudioRef.current
      ) {
        remoteAudioRef.current.srcObject =
          event.streams[0];

        remoteAudioRef.current
          .play()
          .catch((error) => {
            console.log(
              "Audio play error:",
              error
            );
          });
      }
    };

    // ===================================
    // CONNECTION STATE
    // ===================================

    peer.onconnectionstatechange =
      () => {
        console.log(
          "WebRTC connection state:",
          peer.connectionState
        );

        if (
          peer.connectionState ===
          "failed"
        ) {
          console.log(
            "WebRTC connection failed"
          );

          cleanupCall(false);
        }

        if (
          peer.connectionState ===
          "closed"
        ) {
          console.log(
            "WebRTC connection closed"
          );
        }
      };

    return peer;
  };

  // =====================================
  // ADD QUEUED ICE CANDIDATES
  // =====================================

  const addQueuedIceCandidates =
    async () => {
      if (
        !peerConnectionRef.current
      ) {
        return;
      }

      if (
        !remoteDescriptionSetRef.current
      ) {
        return;
      }

      const candidates =
        iceCandidatesRef.current;

      iceCandidatesRef.current =
        [];

      for (
        const candidate of candidates
      ) {
        try {
          await peerConnectionRef.current.addIceCandidate(
            new RTCIceCandidate(
              candidate
            )
          );

          console.log(
            "Queued ICE candidate added"
          );
        } catch (error) {
          console.log(
            "Queued ICE error:",
            error
          );
        }
      }
    };

  // =====================================
  // CLEANUP CALL
  // =====================================

  const cleanupCall = (
    notifyOtherUser = false
  ) => {
    console.log(
      "Cleaning up call"
    );

    // Notify other person
    if (
      notifyOtherUser &&
      callReceiver?.email
    ) {
      console.log(
        "Sending end-call to:",
        callReceiver.email
      );

      socket.emit(
        "end-call",
        {
          receiver:
            callReceiver.email,
        }
      );
    }

    // Stop microphone
    if (
      localStreamRef.current
    ) {
      localStreamRef.current
        .getTracks()
        .forEach(
          (track) => {
            track.stop();
          }
        );

      localStreamRef.current =
        null;
    }

    // Close WebRTC connection
    if (
      peerConnectionRef.current
    ) {
      peerConnectionRef.current.close();

      peerConnectionRef.current =
        null;
    }

    // Clear remote audio
    if (
      remoteAudioRef.current
    ) {
      remoteAudioRef.current.srcObject =
        null;
    }

    // Clear ICE
    iceCandidatesRef.current =
      [];

    remoteDescriptionSetRef.current =
      false;

    // Reset states
    setCallType(null);

    setIncomingCaller(null);

    setIncomingOffer(null);

    setCallReceiver(null);

    setIsMuted(false);
  };

  // =====================================
  // INCOMING CALL
  // =====================================

  useEffect(() => {
    const handleIncomingCall =
      async ({
        caller,
        offer,
      }) => {
        console.log(
          "📞 INCOMING CALL RECEIVED"
        );

        console.log(
          "Caller:",
          caller
        );

        // Get caller's name and image
        const callerDetails =
          await getUserDetails(
            caller
          );

        console.log(
          "Caller details:",
          callerDetails
        );

        setIncomingCaller(
          callerDetails
        );

        setIncomingOffer(
          offer
        );

        // Store caller object
        setCallReceiver(
          callerDetails
        );

        setCallType(
          "incoming"
        );
      };

    socket.on(
      "incoming-call",
      handleIncomingCall
    );

    return () => {
      socket.off(
        "incoming-call",
        handleIncomingCall
      );
    };
  }, []);

  // =====================================
  // CALL FAILED
  // =====================================

  useEffect(() => {
    const handleCallFailed =
      ({ message }) => {
        console.log(
          "Call failed:",
          message
        );

        alert(message);

        cleanupCall(false);
      };

    socket.on(
      "call-failed",
      handleCallFailed
    );

    return () => {
      socket.off(
        "call-failed",
        handleCallFailed
      );
    };
  }, []);

  // =====================================
  // CALL ACCEPTED
  // =====================================

  useEffect(() => {
    const handleCallAccepted =
      async ({
        answer,
      }) => {
        try {
          console.log(
            "📞 Call accepted"
          );

          if (
            !peerConnectionRef.current
          ) {
            console.log(
              "No peer connection"
            );

            return;
          }

          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(
              answer
            )
          );

          console.log(
            "Remote description set"
          );

          remoteDescriptionSetRef.current =
            true;

          await addQueuedIceCandidates();

          setCallType(
            "connected"
          );

          console.log(
            "✅ Call connected"
          );
        } catch (error) {
          console.log(
            "Call accepted error:",
            error
          );

          cleanupCall(false);
        }
      };

    socket.on(
      "call-accepted",
      handleCallAccepted
    );

    return () => {
      socket.off(
        "call-accepted",
        handleCallAccepted
      );
    };
  }, []);

  // =====================================
  // ICE CANDIDATE
  // =====================================

  useEffect(() => {
    const handleIceCandidate =
      async ({
        candidate,
      }) => {
        if (!candidate) {
          return;
        }

        console.log(
          "ICE candidate received"
        );

        if (
          peerConnectionRef.current &&
          remoteDescriptionSetRef.current
        ) {
          try {
            await peerConnectionRef.current.addIceCandidate(
              new RTCIceCandidate(
                candidate
              )
            );

            console.log(
              "ICE candidate added"
            );
          } catch (error) {
            console.log(
              "ICE candidate error:",
              error
            );
          }
        } else {
          console.log(
            "ICE candidate queued"
          );

          iceCandidatesRef.current.push(
            candidate
          );
        }
      };

    socket.on(
      "ice-candidate",
      handleIceCandidate
    );

    return () => {
      socket.off(
        "ice-candidate",
        handleIceCandidate
      );
    };
  }, []);

  // =====================================
  // CALL REJECTED
  // =====================================

  useEffect(() => {
    const handleCallRejected =
      () => {
        console.log(
          "❌ Call rejected"
        );

        alert(
          "Call rejected"
        );

        cleanupCall(false);
      };

    socket.on(
      "call-rejected",
      handleCallRejected
    );

    return () => {
      socket.off(
        "call-rejected",
        handleCallRejected
      );
    };
  }, []);

  // =====================================
  // CALL ENDED
  // =====================================

  useEffect(() => {
    const handleCallEnded =
      () => {
        console.log(
          "📞 Other user ended the call"
        );

        cleanupCall(false);
      };

    socket.on(
      "call-ended",
      handleCallEnded
    );

    return () => {
      socket.off(
        "call-ended",
        handleCallEnded
      );
    };
  }, []);

  // =====================================
  // ACCEPT CALL
  // =====================================

  const acceptCall =
    async () => {
      try {
        if (
          !incomingCaller ||
          !incomingOffer
        ) {
          console.log(
            "Missing incoming call data"
          );

          return;
        }

        console.log(
          "Accepting call from:",
          incomingCaller.email
        );

        // Get microphone
        const stream =
          await navigator.mediaDevices.getUserMedia(
            {
              audio: true,
              video: false,
            }
          );

        localStreamRef.current =
          stream;

        // Create peer
        const peer =
          createPeerConnection(
            incomingCaller.email
          );

        // Add microphone
        stream
          .getTracks()
          .forEach(
            (track) => {
              peer.addTrack(
                track,
                stream
              );
            }
          );

        // Set caller offer
        await peer.setRemoteDescription(
          new RTCSessionDescription(
            incomingOffer
          )
        );

        console.log(
          "Incoming offer set"
        );

        remoteDescriptionSetRef.current =
          true;

        // Add queued ICE
        await addQueuedIceCandidates();

        // Create answer
        const answer =
          await peer.createAnswer();

        await peer.setLocalDescription(
          answer
        );

        console.log(
          "Answer created"
        );

        // Send answer to caller
        socket.emit(
          "accept-call",
          {
            caller:
              incomingCaller.email,
            answer,
          }
        );

        setCallType(
          "connected"
        );

        console.log(
          "✅ Answer sent"
        );
      } catch (error) {
        console.log(
          "Accept call error:",
          error
        );

        alert(
          "Could not accept the call."
        );

        cleanupCall(false);
      }
    };

  // =====================================
  // REJECT CALL
  // =====================================

  const rejectCall =
    () => {
      console.log(
        "Rejecting call"
      );

      if (
        incomingCaller?.email
      ) {
        socket.emit(
          "reject-call",
          {
            caller:
              incomingCaller.email,
          }
        );
      }

      cleanupCall(false);
    };

  // =====================================
  // MUTE / UNMUTE
  // =====================================

  const toggleMute =
    () => {
      if (
        !localStreamRef.current
      ) {
        return;
      }

      const audioTrack =
        localStreamRef.current.getAudioTracks()[0];

      if (!audioTrack) {
        return;
      }

      audioTrack.enabled =
        !audioTrack.enabled;

      setIsMuted(
        !audioTrack.enabled
      );

      console.log(
        audioTrack.enabled
          ? "Microphone unmuted"
          : "Microphone muted"
      );
    };

  // =====================================
  // END CALL
  // =====================================

  const endCall = () => {
    console.log(
      "Ending call"
    );

    cleanupCall(true);
  };

  // =====================================
  // START OUTGOING CALL
  // =====================================

  const startCall = async (
    receiver
  ) => {
    try {
      if (
        !user?.email ||
        !receiver?.email
      ) {
        console.log(
          "Missing caller or receiver"
        );

        return;
      }

      if (callType) {
        console.log(
          "Already in a call"
        );

        return;
      }

      console.log(
        "Starting call:",
        user.email,
        "->",
        receiver.email
      );

      // Get microphone
      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            audio: true,
            video: false,
          }
        );

      localStreamRef.current =
        stream;

      // Create peer
      const peer =
        createPeerConnection(
          receiver.email
        );

      // Add microphone
      stream
        .getTracks()
        .forEach(
          (track) => {
            peer.addTrack(
              track,
              stream
            );
          }
        );

      // Create offer
      const offer =
        await peer.createOffer();

      // Set local description
      await peer.setLocalDescription(
        offer
      );

      console.log(
        "Offer created"
      );

      // IMPORTANT:
      // Store the COMPLETE user object
      // instead of only the email.
      setCallReceiver(
        receiver
      );

      setCallType(
        "calling"
      );

      console.log(
        "Sending call offer to:",
        receiver.email
      );

      // Send call request
      socket.emit(
        "call-user",
        {
          caller:
            user.email,

          receiver:
            receiver.email,

          offer,
        }
      );
    } catch (error) {
      console.log(
        "Start call error:",
        error
      );

      if (
        error.name ===
        "NotAllowedError"
      ) {
        alert(
          "Microphone permission was denied."
        );
      } else if (
        error.name ===
        "NotFoundError"
      ) {
        alert(
          "No microphone was found."
        );
      } else {
        alert(
          "Could not start the call."
        );
      }

      cleanupCall(false);
    }
  };

  // =====================================
  // GLOBAL START CALL FUNCTION
  // =====================================

  useEffect(() => {
    window.startAudioCall =
      startCall;

    return () => {
      delete window.startAudioCall;
    };
  });

  // =====================================
  // UI
  // =====================================

  return (
    <>
      {/* Hidden audio element */}

      <audio
        ref={remoteAudioRef}
        autoPlay
        playsInline
      />

      {/* Call popup */}

      {callType && (
        <CallModal
          type={callType}
          caller={incomingCaller}
          selectedUser={
            callReceiver
          }
          onAccept={
            acceptCall
          }
          onReject={
            rejectCall
          }
          onEnd={
            endCall
          }
          isMuted={
            isMuted
          }
          onMute={
            toggleMute
          }
        />
      )}
    </>
  );
};

export default CallManager;