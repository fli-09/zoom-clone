"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Clock,
  Copy,
  Check,
  ArrowLeft,
  Circle,
} from "lucide-react";
import { VideoTile } from "@/components/meeting-room/VideoTile";
import { MeetingToolbar } from "@/components/meeting-room/MeetingToolbar";
import { ParticipantsPanel } from "@/components/meeting-room/ParticipantsPanel";
import { ChatPanel } from "@/components/meeting-room/ChatPanel";
import { ScreenShareBanner } from "@/components/meeting-room/ScreenShareBanner";
import { PreJoinLobby } from "@/components/meeting-room/PreJoinLobby";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import { MeetingParticipant, ChatMessage } from "@/lib/types";
import { copyToClipboard } from "@/lib/utils";
import { getWebSocketUrl, saveMeetingRecording } from "@/lib/api";

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

function MeetingRoomContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success, error } = useToast();

  const rawRoomId = params?.room_id as string;
  const roomId = rawRoomId || "zoom-meeting";

  // URL query params
  const queryName = searchParams?.get("name");
  const queryMuted = searchParams?.get("muted") === "1";
  const queryVideoOff = searchParams?.get("videoOff") === "1";

  // Pre-join status: every user verifies name and previews camera/mic in PreJoinLobby
  const [hasJoined, setHasJoined] = useState<boolean>(false);
  const [displayName, setDisplayName] = useState<string>(queryName || "");
  const [participantId] = useState<string>(() => `user-${Math.random().toString(36).substring(2, 9)}`);

  // Meeting states
  const [isMuted, setIsMuted] = useState(queryMuted);
  const [isVideoOff, setIsVideoOff] = useState(queryVideoOff);
  const [isSharing, setIsSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Live media streams
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<{ [id: string]: MediaStream }>({});
  const [remoteScreenSharer, setRemoteScreenSharer] = useState<string | null>(null);

  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const isSharingRef = useRef<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // WebRTC PeerConnections map: remoteParticipantId -> RTCPeerConnection
  const peerConnectionsRef = useRef<{ [id: string]: RTCPeerConnection }>({});
  // ICE candidate queue for candidates arriving before remote description is ready
  const pendingIceCandidatesRef = useRef<{ [id: string]: RTCIceCandidateInit[] }>({});

  // Panels
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Floating reactions
  const [floatingReaction, setFloatingReaction] = useState<string | null>(null);

  // Timer
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // Dynamic participants list
  const [participants, setParticipants] = useState<MeetingParticipant[]>([]);

  // Chat messages
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // WebSocket reference
  const wsRef = useRef<WebSocket | null>(null);

  // Audio Context and Analyser for Green Speaking Border
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Keep refs in sync
  useEffect(() => {
    isSharingRef.current = isSharing;
  }, [isSharing]);

  useEffect(() => {
    screenStreamRef.current = screenStream;
  }, [screenStream]);

  // Timer interval
  useEffect(() => {
    if (!hasJoined) return;
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [hasJoined]);

  const formatTimer = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) {
      return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Helper: Create and configure an RTCPeerConnection for a remote participant
  const getOrCreatePeerConnection = (rawTargetId: string | number): RTCPeerConnection => {
    const targetId = String(rawTargetId);
    if (peerConnectionsRef.current[targetId]) {
      return peerConnectionsRef.current[targetId];
    }

    const pc = new RTCPeerConnection(RTC_CONFIG);

    // Add audio and video transceivers to ensure bidirectional media lines in SDP offer/answer
    try {
      pc.addTransceiver("audio", { direction: "sendrecv" });
      pc.addTransceiver("video", { direction: "sendrecv" });
    } catch (e) {
      console.warn("addTransceiver fallback:", e);
    }

    // Attach active local tracks to transceivers or peer connection
    const currentStream = isSharingRef.current
      ? screenStreamRef.current || localStreamRef.current
      : localStreamRef.current;

    if (currentStream) {
      const transceivers = pc.getTransceivers();
      const audioTransceiver = transceivers.find((t) => t.receiver.track.kind === "audio");
      const videoTransceiver = transceivers.find((t) => t.receiver.track.kind === "video");

      const audioTrack = currentStream.getAudioTracks()[0];
      const videoTrack = currentStream.getVideoTracks()[0];

      if (audioTrack && audioTransceiver) {
        audioTransceiver.sender.replaceTrack(audioTrack).catch(() => {});
      } else if (audioTrack) {
        try { pc.addTrack(audioTrack, currentStream); } catch (_) {}
      }

      if (videoTrack && videoTransceiver) {
        videoTransceiver.sender.replaceTrack(videoTrack).catch(() => {});
      } else if (videoTrack) {
        try { pc.addTrack(videoTrack, currentStream); } catch (_) {}
      }
    }

    // When remote track is received from this peer
    pc.ontrack = (event) => {
      console.log(`[WebRTC] Received remote track: kind=${event.track.kind} id=${event.track.id} from ${targetId}`);
      setRemoteStreams((prev) => {
        const existing = prev[targetId];
        // Create a new MediaStream instance to trigger React state updates
        const updatedStream = existing ? new MediaStream(existing.getTracks()) : new MediaStream();

        if (!updatedStream.getTracks().some((t) => t.id === event.track.id)) {
          updatedStream.addTrack(event.track);
        }

        if (event.streams && event.streams[0]) {
          event.streams[0].getTracks().forEach((t) => {
            if (!updatedStream.getTracks().some((ex) => ex.id === t.id)) {
              updatedStream.addTrack(t);
            }
          });
        }

        return {
          ...prev,
          [targetId]: updatedStream,
        };
      });
    };

    // When ICE candidate is generated
    pc.onicecandidate = (event) => {
      if (event.candidate && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "webrtc_ice",
            target_id: targetId,
            candidate: event.candidate,
          })
        );
      }
    };

    peerConnectionsRef.current[targetId] = pc;
    return pc;
  };

  // Pre-join entry handler
  const handleJoinFromLobby = (
    chosenName: string,
    chosenMuted: boolean,
    chosenVideoOff: boolean,
    stream: MediaStream | null
  ) => {
    setDisplayName(chosenName);
    setIsMuted(chosenMuted);
    setIsVideoOff(chosenVideoOff);
    if (stream) {
      localStreamRef.current = stream;
      stream.getAudioTracks().forEach((t) => (t.enabled = !chosenMuted));
      stream.getVideoTracks().forEach((t) => (t.enabled = !chosenVideoOff));
      setLocalStream(stream);
    }
    setHasJoined(true);
  };

  // Fallback media initialization if stream was not available from lobby
  useEffect(() => {
    if (!hasJoined) return;
    if (localStreamRef.current && localStreamRef.current.getTracks().length > 0) return;

    let mounted = true;
    async function initMedia() {
      try {
        if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          if (!mounted) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }
          localStreamRef.current = stream;
          stream.getAudioTracks().forEach((t) => (t.enabled = !isMuted));
          stream.getVideoTracks().forEach((t) => (t.enabled = !isVideoOff));
          setLocalStream(stream);

          // Update active transceivers / senders on all active peer connections
          for (const pc of Object.values(peerConnectionsRef.current)) {
            const transceivers = pc.getTransceivers();
            const audioTransceiver = transceivers.find((t) => t.receiver.track.kind === "audio");
            const videoTransceiver = transceivers.find((t) => t.receiver.track.kind === "video");
            const audioTrack = stream.getAudioTracks()[0];
            const videoTrack = stream.getVideoTracks()[0];

            if (audioTrack && audioTransceiver) {
              audioTransceiver.sender.replaceTrack(audioTrack).catch(() => {});
            } else if (audioTrack) {
              try { pc.addTrack(audioTrack, stream); } catch (_) {}
            }

            if (videoTrack && videoTransceiver) {
              videoTransceiver.sender.replaceTrack(videoTrack).catch(() => {});
            } else if (videoTrack) {
              try { pc.addTrack(videoTrack, stream); } catch (_) {}
            }
          }
        }
      } catch (err) {
        console.warn("Direct media init fallback failed:", err);
      }
    }

    initMedia();
    return () => {
      mounted = false;
    };
  }, [hasJoined, isMuted, isVideoOff]);

  // Audio track mute sync
  useEffect(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach((t) => {
        t.enabled = !isMuted;
      });
    }
    // Broadcast status change via WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "status_update",
          updates: { isMuted },
        })
      );
    }
  }, [isMuted, localStream]);

  // Video track camera sync
  useEffect(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach((t) => {
        t.enabled = !isVideoOff;
      });
    }
    // Broadcast status change via WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "status_update",
          updates: { isVideoOff },
        })
      );
    }
  }, [isVideoOff, localStream]);

  // Active speaker volume analyser (Green Speaking Border)
  useEffect(() => {
    if (!localStream || isMuted || !hasJoined) {
      setIsSpeaking(false);
      return;
    }

    const audioTrack = localStream.getAudioTracks()[0];
    if (!audioTrack) return;

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext ||
        AudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const mediaStreamSource = ctx.createMediaStreamSource(new MediaStream([audioTrack]));
      mediaStreamSource.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      let speakingDebounce: NodeJS.Timeout | null = null;

      const checkVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;

        // Active speaker threshold
        if (average > 15) {
          setIsSpeaking(true);
          if (speakingDebounce) clearTimeout(speakingDebounce);
          speakingDebounce = setTimeout(() => {
            setIsSpeaking(false);
          }, 400);
        }

        animFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();

      return () => {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        if (speakingDebounce) clearTimeout(speakingDebounce);
        ctx.close().catch(() => {});
      };
    } catch (err) {
      console.warn("Audio analyser initialization error:", err);
    }
  }, [localStream, isMuted, hasJoined]);

  // Sync isSpeaking across WebSocket
  useEffect(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "status_update",
          updates: { isSpeaking },
        })
      );
    }
  }, [isSpeaking]);

  // Sync hand raised across WebSocket
  useEffect(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "status_update",
          updates: { isHandRaised },
        })
      );
    }
  }, [isHandRaised]);

  // WebSocket connection & real-time WebRTC room communication
  useEffect(() => {
    if (!hasJoined || !displayName.trim()) return;

    const wsUrl = getWebSocketUrl(roomId, participantId, displayName.trim());
    const socket = new WebSocket(wsUrl);
    wsRef.current = socket;

    socket.onopen = () => {
      console.log(`Connected to room ${roomId} as ${displayName}`);
    };

    socket.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "room_state") {
          // Initial participants list received from server
          setParticipants(data.participants);

          // For every other participant already in the room, initiate a WebRTC connection
          for (const p of data.participants) {
            if (p.id !== participantId) {
              const pc = getOrCreatePeerConnection(p.id);
              try {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                if (socket.readyState === WebSocket.OPEN) {
                  socket.send(
                    JSON.stringify({
                      type: "webrtc_offer",
                      target_id: p.id,
                      sdp: offer,
                    })
                  );
                }
              } catch (e) {
                console.error("Failed to create WebRTC offer:", e);
              }
            }
          }
        } else if (data.type === "participant_joined") {
          // Another participant entered the room
          const newP: MeetingParticipant = data.participant;
          setParticipants((prev) => {
            if (prev.some((p) => p.id === newP.id)) return prev;
            return [...prev, newP];
          });
          getOrCreatePeerConnection(newP.id);
          success(`${newP.name} joined the meeting`);
        } else if (data.type === "participant_left") {
          // A participant disconnected
          const leftId = String(data.participant_id);
          if (peerConnectionsRef.current[leftId]) {
            peerConnectionsRef.current[leftId].close();
            delete peerConnectionsRef.current[leftId];
          }
          if (pendingIceCandidatesRef.current[leftId]) {
            delete pendingIceCandidatesRef.current[leftId];
          }
          setRemoteStreams((prev) => {
            const copy = { ...prev };
            delete copy[leftId];
            return copy;
          });
          setParticipants((prev) => prev.filter((p) => String(p.id) !== leftId));
          if (String(remoteScreenSharer) === leftId) {
            setRemoteScreenSharer(null);
          }
        } else if (data.type === "webrtc_offer") {
          // Received WebRTC offer from a peer
          const senderId = String(data.sender_id);
          const pc = getOrCreatePeerConnection(senderId);
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));

            // Flush pending ICE candidates for this peer
            const pending = pendingIceCandidatesRef.current[senderId];
            if (pending && pending.length > 0) {
              for (const cand of pending) {
                try {
                  await pc.addIceCandidate(new RTCIceCandidate(cand));
                } catch (e) {
                  console.warn("Error adding queued ICE candidate:", e);
                }
              }
              pendingIceCandidatesRef.current[senderId] = [];
            }

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            if (socket.readyState === WebSocket.OPEN) {
              socket.send(
                JSON.stringify({
                  type: "webrtc_answer",
                  target_id: senderId,
                  sdp: answer,
                })
              );
            }
          } catch (e) {
            console.error("Failed handling WebRTC offer:", e);
          }
        } else if (data.type === "webrtc_answer") {
          // Received WebRTC answer from a peer
          const senderId = String(data.sender_id);
          const pc = peerConnectionsRef.current[senderId];
          if (pc) {
            try {
              await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));

              // Flush pending ICE candidates for this peer
              const pending = pendingIceCandidatesRef.current[senderId];
              if (pending && pending.length > 0) {
                for (const cand of pending) {
                  try {
                    await pc.addIceCandidate(new RTCIceCandidate(cand));
                  } catch (e) {
                    console.warn("Error adding queued ICE candidate:", e);
                  }
                }
                pendingIceCandidatesRef.current[senderId] = [];
              }
            } catch (e) {
              console.error("Failed setting remote answer:", e);
            }
          }
        } else if (data.type === "webrtc_ice") {
          // Received ICE candidate from a peer
          const senderId = String(data.sender_id);
          const pc = peerConnectionsRef.current[senderId];
          if (data.candidate) {
            if (pc && pc.remoteDescription && pc.remoteDescription.type) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
              } catch (e) {
                console.warn("Error adding ICE candidate directly:", e);
              }
            } else {
              // Queue candidate until remote description is set
              if (!pendingIceCandidatesRef.current[senderId]) {
                pendingIceCandidatesRef.current[senderId] = [];
              }
              pendingIceCandidatesRef.current[senderId].push(data.candidate);
            }
          }
        } else if (data.type === "screen_share_status") {
          // Another participant started or stopped screen sharing
          if (data.isSharing) {
            setRemoteScreenSharer(String(data.participant_id));
          } else {
            if (String(remoteScreenSharer) === String(data.participant_id)) {
              setRemoteScreenSharer(null);
            }
          }
        } else if (data.type === "chat") {
          // Chat message received from someone in the room
          setMessages((prev) => {
            if (prev.some((m) => m.id === data.message.id)) return prev;
            return [...prev, data.message];
          });
        } else if (data.type === "reaction") {
          // Floating emoji reaction triggered by someone in the room
          setFloatingReaction(data.emoji);
          setTimeout(() => {
            setFloatingReaction(null);
          }, 2500);
        } else if (data.type === "participant_updated") {
          // Status update (mic/camera/hand/speaking)
          const updated = data.participant;
          setParticipants((prev) =>
            prev.map((p) => (String(p.id) === String(updated.id) ? { ...p, ...updated } : p))
          );
        } else if (data.type === "host_muted_all") {
          // Host muted everyone
          setIsMuted(true);
          error("The host has muted your microphone");
        } else if (data.type === "removed_by_host") {
          // Host removed you from the meeting
          error("You were removed from this meeting by the host");
          router.push("/");
        }
      } catch (err) {
        console.error("Failed to parse WebSocket message:", err);
      }
    };

    socket.onerror = (e) => {
      console.warn("WebSocket encounter error, falling back locally:", e);
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      socket.close();
      wsRef.current = null;
      for (const pc of Object.values(peerConnectionsRef.current)) {
        pc.close();
      }
      peerConnectionsRef.current = {};
      pendingIceCandidatesRef.current = {};
    };
  }, [hasJoined, displayName, roomId, participantId, success, error, router, remoteScreenSharer]);

  // Keep local participant in the participants list synced with local states
  useEffect(() => {
    if (!hasJoined) return;
    setParticipants((prev) => {
      const exists = prev.some((p) => p.id === participantId);
      if (!exists) {
        return [
          {
            id: participantId,
            name: displayName,
            role: prev.length === 0 ? "host" : "participant",
            isMuted,
            isVideoOff,
            isHandRaised,
            isSpeaking,
          },
          ...prev,
        ];
      }
      return prev.map((p) =>
        p.id === participantId
          ? {
              ...p,
              name: displayName,
              isMuted,
              isVideoOff,
              isHandRaised,
              isSpeaking,
            }
          : p
      );
    });
  }, [hasJoined, participantId, displayName, isMuted, isVideoOff, isHandRaised, isSpeaking]);

  // Send in-meeting chat message
  const handleSendMessage = (text: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    const newMsg: ChatMessage = {
      id: `m-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      sender: displayName,
      timestamp: timeStr,
      text,
      isMe: true,
    };

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "chat",
          message: newMsg,
        })
      );
    } else {
      setMessages((prev) => [...prev, newMsg]);
    }
  };

  // Send emoji reaction
  const handleReaction = (emoji: string) => {
    setFloatingReaction(emoji);
    setTimeout(() => {
      setFloatingReaction(null);
    }, 2500);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "reaction",
          emoji,
          sender: displayName,
        })
      );
    }
  };

  // Screen share handler
  const handleToggleShare = async () => {
    if (isSharing) {
      handleStopSharing();
    } else {
      try {
        if (typeof navigator !== "undefined" && navigator.mediaDevices?.getDisplayMedia) {
          const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          const screenTrack = stream.getVideoTracks()[0];
          if (!screenTrack) return;

          screenStreamRef.current = stream;
          setScreenStream(stream);
          setIsSharing(true);

          // Replace WebRTC video track on all active peer connections
          for (const pc of Object.values(peerConnectionsRef.current)) {
            const transceivers = pc.getTransceivers();
            const videoTransceiver = transceivers.find((t) => t.receiver.track.kind === "video");
            if (videoTransceiver) {
              await videoTransceiver.sender.replaceTrack(screenTrack).catch((e) => console.warn(e));
            } else {
              const senders = pc.getSenders();
              const videoSender = senders.find((s) => s.track?.kind === "video");
              if (videoSender) {
                await videoSender.replaceTrack(screenTrack).catch((e) => console.warn(e));
              } else {
                try { pc.addTrack(screenTrack, stream); } catch (_) {}
              }
            }
          }

          success("Screen sharing started");

          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(
              JSON.stringify({
                type: "screen_share_status",
                isSharing: true,
              })
            );
          }

          screenTrack.onended = () => {
            handleStopSharing();
          };
        }
      } catch (err) {
        console.warn("Screen share cancelled or not allowed:", err);
      }
    }
  };

  const handleStopSharing = async () => {
    const cameraTrack = localStreamRef.current?.getVideoTracks()[0] || null;

    for (const pc of Object.values(peerConnectionsRef.current)) {
      const transceivers = pc.getTransceivers();
      const videoTransceiver = transceivers.find((t) => t.receiver.track.kind === "video");
      if (videoTransceiver) {
        await videoTransceiver.sender.replaceTrack(cameraTrack).catch((e) => console.warn(e));
      } else {
        const senders = pc.getSenders();
        const videoSender = senders.find((s) => s.track?.kind === "video");
        if (videoSender) {
          await videoSender.replaceTrack(cameraTrack).catch((e) => console.warn(e));
        }
      }
    }

    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }
    setScreenStream(null);
    setIsSharing(false);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "screen_share_status",
          isSharing: false,
        })
      );
    }
  };

  // Host Controls: Mute All
  const handleMuteAll = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "mute_all" }));
    }
    setParticipants((prev) =>
      prev.map((p) => (p.id !== participantId ? { ...p, isMuted: true } : p))
    );
    success("All participants have been muted");
  };

  // Host Controls: Remove Participant
  const handleRemoveParticipant = (targetId: string | number) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "remove_participant",
          target_id: String(targetId),
        })
      );
    }
    const target = participants.find((p) => String(p.id) === String(targetId));
    setParticipants((prev) => prev.filter((p) => String(p.id) !== String(targetId)));
    success(`${target?.name || "Participant"} removed from meeting`);
  };

  // Meeting Recording & DB Persistence
  const handleToggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    } else {
      // Start recording
      try {
        const streamToRecord = screenStream || localStream;
        if (!streamToRecord) {
          error("Please enable camera or share screen to record");
          return;
        }

        recordedChunksRef.current = [];
        const recorder = new MediaRecorder(streamToRecord, {
          mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
            ? "video/webm;codecs=vp9"
            : "video/webm",
        });

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          }
        };

        recorder.onstop = async () => {
          const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
          const fileName = `meeting-${roomId}-${Date.now()}.webm`;

          // 1. Download file locally
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.style.display = "none";
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
          }, 100);

          // 2. Save recording record to backend database
          try {
            await saveMeetingRecording(roomId, {
              file_name: fileName,
              duration_seconds: secondsElapsed,
              file_size_bytes: blob.size,
            });
            success("Meeting recording saved to database and downloaded!");
          } catch (dbErr) {
            console.warn("Could not save recording metadata to DB:", dbErr);
            success("Recording saved and downloaded locally!");
          }
        };

        recorder.start(1000);
        mediaRecorderRef.current = recorder;
        setIsRecording(true);
        success("Meeting recording started");
      } catch (err) {
        console.error("Recording initialization failed:", err);
        error("Could not start recording on this device");
      }
    }
  };

  const handleCopyInvite = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const inviteUrl = `${origin}/meeting/${roomId}`;
    const ok = await copyToClipboard(inviteUrl);
    if (ok) {
      setCopied(true);
      success("Invite link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLeave = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (screenStream) {
      screenStream.getTracks().forEach((t) => t.stop());
    }
    if (wsRef.current) {
      wsRef.current.close();
    }
    for (const pc of Object.values(peerConnectionsRef.current)) {
      pc.close();
    }
    peerConnectionsRef.current = {};
    router.push("/");
  };

  // If user hasn't joined from lobby yet, show the Zoom Pre-Join screen
  if (!hasJoined) {
    return (
      <PreJoinLobby
        roomId={roomId}
        initialName={displayName}
        initialMuted={isMuted}
        initialVideoOff={isVideoOff}
        onJoin={handleJoinFromLobby}
      />
    );
  }

  return (
    <div className="h-screen w-screen bg-[#07090C] text-slate-100 flex flex-col overflow-hidden select-none">
      {/* Top Meeting Header */}
      <header className="h-14 px-4 sm:px-6 bg-dark-surface/80 border-b border-dark-border/80 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h1 className="text-xs sm:text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              <span>Room: {roomId}</span>
            </h1>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-dark-card border border-dark-border text-[11px] font-mono text-slate-400">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>{formatTimer(secondsElapsed)}</span>
          </div>

          {isRecording && (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-400 text-[11px] font-medium animate-pulse">
              <Circle className="w-2.5 h-2.5 fill-current" />
              <span>REC</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 px-2.5 py-1 rounded-full bg-dark-card border border-dark-border">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted</span>
          </div>

          <button
            onClick={handleCopyInvite}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-medium border border-white/5 transition-colors"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span className="hidden sm:inline">Copy Link</span>
          </button>
        </div>
      </header>

      {/* Screen Share Alert Banner */}
      <ScreenShareBanner
        isSharing={isSharing}
        onStopSharing={handleStopSharing}
      />

      {/* Main Video Stage & Side Panels */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Floating Reaction Animation */}
        {floatingReaction && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-bounce text-6xl">
            {floatingReaction}
          </div>
        )}

        {/* Video Grid Canvas */}
        <main className="flex-1 p-3 sm:p-5 flex items-center justify-center overflow-hidden">
          <div
            className={`w-full h-full max-w-6xl grid gap-3 sm:gap-4 items-center justify-center ${
              participants.length <= 1
                ? "grid-cols-1 max-w-4xl max-h-[80vh]"
                : participants.length === 2
                ? "grid-cols-1 sm:grid-cols-2 max-h-[80vh]"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-h-[85vh]"
            }`}
          >
            {participants.map((p) => {
              const pidStr = String(p.id);
              const isLocal = pidStr === String(participantId);
              const streamToUse = isLocal
                ? isSharing
                  ? screenStream || localStream
                  : localStream
                : remoteStreams[pidStr] || null;

              const isThisTileSharing = isLocal ? isSharing : String(remoteScreenSharer) === pidStr;

              return (
                <VideoTile
                  key={pidStr}
                  participant={p}
                  isLocal={isLocal}
                  isScreenSharing={isThisTileSharing}
                  mediaStream={streamToUse}
                  className="w-full h-full max-h-[420px]"
                />
              );
            })}
          </div>
        </main>

        {/* Participants Panel */}
        <ParticipantsPanel
          isOpen={isParticipantsOpen}
          onClose={() => setIsParticipantsOpen(false)}
          participants={participants}
          roomId={roomId}
          onMuteAll={handleMuteAll}
          onRemoveParticipant={handleRemoveParticipant}
        />

        {/* Chat Panel */}
        <ChatPanel
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          messages={messages}
          onSendMessage={handleSendMessage}
        />
      </div>

      {/* Bottom Meeting Toolbar */}
      <MeetingToolbar
        isMuted={isMuted}
        isVideoOff={isVideoOff}
        isSharing={isSharing}
        isRecording={isRecording}
        isHandRaised={isHandRaised}
        isParticipantsOpen={isParticipantsOpen}
        isChatOpen={isChatOpen}
        participantCount={participants.length}
        onToggleMic={() => setIsMuted(!isMuted)}
        onToggleVideo={() => setIsVideoOff(!isVideoOff)}
        onToggleShare={handleToggleShare}
        onToggleRecording={handleToggleRecording}
        onToggleHand={() => {
          setIsHandRaised(!isHandRaised);
          success(isHandRaised ? "Lowered hand" : "Raised hand");
        }}
        onToggleParticipants={() => {
          setIsParticipantsOpen(!isParticipantsOpen);
          if (isChatOpen) setIsChatOpen(false);
        }}
        onToggleChat={() => {
          setIsChatOpen(!isChatOpen);
          if (isParticipantsOpen) setIsParticipantsOpen(false);
        }}
        onLeaveMeeting={handleLeave}
        onReaction={handleReaction}
      />
    </div>
  );
}

export default function MeetingRoomPage() {
  return (
    <ToastProvider>
      <Suspense
        fallback={
          <div className="h-screen w-screen bg-[#07090C] flex items-center justify-center text-slate-400 text-sm">
            Connecting to meeting room...
          </div>
        }
      >
        <MeetingRoomContent />
      </Suspense>
    </ToastProvider>
  );
}
