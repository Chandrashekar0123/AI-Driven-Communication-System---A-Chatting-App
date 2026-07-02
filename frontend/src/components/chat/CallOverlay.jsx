import React, { useEffect, useRef, useState } from "react";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from "lucide-react";

const CallOverlay = () => {
  const { authUser, socket } = useAuthStore();
  const { selectedChat } = useChatStore();

  const [stream, setStream] = useState(null);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerName, setCallerName] = useState("");
  const [callerSignal, setCallerSignal] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  
  const [micMuted, setMicMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);

  const myVideo = useRef(null);
  const userVideo = useRef(null);
  const connectionRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    const handleCallUser = (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setCallerName(data.name);
      setCallerSignal(data.signal);
    };

    const handleEndCall = () => {
      endCall(false);
    };

    socket.on("callUser", handleCallUser);
    socket.on("endCall", handleEndCall);

    return () => {
      socket.off("callUser", handleCallUser);
      socket.off("endCall", handleEndCall);
    };
  }, [socket]);

  // Expose call initiation via global event
  useEffect(() => {
    const handleStartCall = () => {
      if (!selectedChat || selectedChat.members) return; // 1-on-1 only
      setIsCalling(true);
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((currentStream) => {
        setStream(currentStream);
        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }
        callUser(selectedChat._id, currentStream);
      });
    };

    window.addEventListener("start-call", handleStartCall);
    return () => window.removeEventListener("start-call", handleStartCall);
  }, [selectedChat, socket]);

  const callUser = (idToCall, currentStream) => {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    currentStream.getTracks().forEach((track) => {
      peer.addTrack(track, currentStream);
    });

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        // Send candidate to remote
        socket.emit("callUser", {
          userToCall: idToCall,
          signalData: { type: "candidate", candidate: event.candidate },
          from: authUser._id,
          name: authUser.fullName,
        });
      }
    };

    peer.ontrack = (event) => {
      if (userVideo.current) {
        userVideo.current.srcObject = event.streams[0];
      }
    };
    
    peer.createOffer().then((offer) => {
      peer.setLocalDescription(offer);
      socket.emit("callUser", {
        userToCall: idToCall,
        signalData: offer,
        from: authUser._id,
        name: authUser.fullName,
      });
    });

    socket.on("callAccepted", (signal) => {
      if (signal.type === "answer") {
        setCallAccepted(true);
        peer.setRemoteDescription(new RTCSessionDescription(signal));
      } else if (signal.type === "candidate") {
        peer.addIceCandidate(new RTCIceCandidate(signal.candidate));
      }
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    setCallAccepted(true);
    setReceivingCall(false);

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((currentStream) => {
      setStream(currentStream);
      if (myVideo.current) {
        myVideo.current.srcObject = currentStream;
      }

      const peer = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      currentStream.getTracks().forEach((track) => {
        peer.addTrack(track, currentStream);
      });

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("answerCall", { signal: { type: "candidate", candidate: event.candidate }, to: caller });
        }
      };

      peer.ontrack = (event) => {
        if (userVideo.current) {
          userVideo.current.srcObject = event.streams[0];
        }
      };

      if (callerSignal.type === 'offer') {
        peer.setRemoteDescription(new RTCSessionDescription(callerSignal)).then(() => {
          peer.createAnswer().then((answer) => {
            peer.setLocalDescription(answer);
            socket.emit("answerCall", { signal: answer, to: caller });
          });
        });
      }

      // Listen for additional candidates from caller
      socket.on("callUser", (data) => {
        if (data.signalData.type === "candidate") {
           peer.addIceCandidate(new RTCIceCandidate(data.signalData.candidate));
        }
      });

      connectionRef.current = peer;
    });
  };

  const endCall = (emit = true) => {
    setCallEnded(true);
    setCallAccepted(false);
    setReceivingCall(false);
    setIsCalling(false);

    if (connectionRef.current) {
      connectionRef.current.close();
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    
    if (emit && (caller || selectedChat)) {
       socket.emit("endCall", { to: caller || selectedChat?._id });
    }
    
    // In a real app we wouldn't reload, but reset states instead.
    setStream(null);
    setCaller("");
    setCallerName("");
    setCallerSignal(null);
    connectionRef.current = null;
  };

  const toggleMic = () => {
    if (stream) {
      stream.getAudioTracks()[0].enabled = micMuted;
      setMicMuted(!micMuted);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks()[0].enabled = videoMuted;
      setVideoMuted(!videoMuted);
    }
  };

  if (!receivingCall && !isCalling && !callAccepted) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center">
      {/* Videos */}
      <div className="relative w-full h-full max-w-6xl max-h-[80vh] flex items-center justify-center bg-black rounded-3xl overflow-hidden mx-4">
        
        {/* Remote Video */}
        {callAccepted && !callEnded ? (
          <video playsInline ref={userVideo} autoPlay className="w-full h-full object-contain" />
        ) : (
          <div className="text-white text-2xl font-bold">
            {receivingCall ? `${callerName} is calling...` : "Calling..."}
          </div>
        )}

        {/* Local Video */}
        {(stream || callAccepted) && (
          <div className="absolute bottom-4 right-4 w-48 h-64 bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10">
            <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover transform -scale-x-100" />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-10 flex items-center gap-6">
        {receivingCall && !callAccepted ? (
          <>
            <button onClick={answerCall} className="size-16 rounded-full bg-purple-500 hover:bg-purple-400 flex items-center justify-center shadow-lg transition-all hover:scale-110">
              <Phone className="text-white size-8" />
            </button>
            <button onClick={() => endCall(true)} className="size-16 rounded-full bg-red-500 hover:bg-red-400 flex items-center justify-center shadow-lg transition-all hover:scale-110">
              <PhoneOff className="text-white size-8" />
            </button>
          </>
        ) : (
          <>
            <button onClick={toggleMic} className={`size-14 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 ${micMuted ? 'bg-red-500/20 text-red-500' : 'bg-white/10 text-white'}`}>
              {micMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
            <button onClick={() => endCall(true)} className="size-16 rounded-full bg-red-500 hover:bg-red-400 flex items-center justify-center shadow-lg transition-all hover:scale-110">
              <PhoneOff className="text-white size-8" />
            </button>
            <button onClick={toggleVideo} className={`size-14 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 ${videoMuted ? 'bg-red-500/20 text-red-500' : 'bg-white/10 text-white'}`}>
              {videoMuted ? <VideoOff size={24} /> : <Video size={24} />}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CallOverlay;
