"""
Zoom Clone - WebRTC Signaling & Real-Time Sync WebSocket Router
==============================================================
Manages real-time room sessions:
1. WebRTC Signaling Relay: Relays SDP offers, answers, and ICE candidate events
   directly between peer connections via client IDs.
2. Room State Synchronization: Broadcasts participant join/leave events, media status changes,
   hand-raising, active speaker detection, and chat messages.
3. Host Control Enforcement: Broadcasts administrative actions such as 'mute_all'
   and 'remove_participant' to maintain room order.
"""

import json
import logging
from typing import Dict, Any
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

logger = logging.getLogger("zoom_clone_ws")

router = APIRouter(tags=["websocket"])


class RoomConnectionManager:
    """
    In-memory state and socket connection registry for active video conference rooms.
    """
    def __init__(self):
        # room_id -> { participant_id: {"ws": WebSocket, "data": dict} }
        self.rooms: Dict[str, Dict[str, Dict[str, Any]]] = {}

    async def connect(self, room_id: str, participant_id: str, websocket: WebSocket, name: str, is_host: bool = False):
        await websocket.accept()
        if room_id not in self.rooms:
            self.rooms[room_id] = {}

        participant_info = {
            "id": participant_id,
            "name": name,
            "role": "host" if is_host or len(self.rooms[room_id]) == 0 else "participant",
            "isMuted": False,
            "isVideoOff": False,
            "isHandRaised": False,
            "isSpeaking": False,
        }

        self.rooms[room_id][participant_id] = {
            "ws": websocket,
            "data": participant_info
        }

        logger.info(f"User {name} ({participant_id}) joined room {room_id}. Total: {len(self.rooms[room_id])}")

        # Send current participants list to the new user
        all_participants = [p["data"] for p in self.rooms[room_id].values()]
        await websocket.send_json({
            "type": "room_state",
            "participants": all_participants
        })

        # Broadcast participant_joined to all other users in this room
        await self.broadcast_except(room_id, participant_id, {
            "type": "participant_joined",
            "participant": participant_info
        })

    def disconnect(self, room_id: str, participant_id: str):
        if room_id in self.rooms and participant_id in self.rooms[room_id]:
            user_data = self.rooms[room_id][participant_id]["data"]
            del self.rooms[room_id][participant_id]
            logger.info(f"User {user_data.get('name')} left room {room_id}. Remaining: {len(self.rooms[room_id])}")
            if not self.rooms[room_id]:
                del self.rooms[room_id]
            return user_data
        return None

    async def broadcast(self, room_id: str, message: dict):
        if room_id not in self.rooms:
            return
        dead_ids = []
        for p_id, p_info in self.rooms[room_id].items():
            try:
                await p_info["ws"].send_json(message)
            except Exception:
                dead_ids.append(p_id)
        for p_id in dead_ids:
            self.disconnect(room_id, p_id)

    async def broadcast_except(self, room_id: str, exclude_id: str, message: dict):
        if room_id not in self.rooms:
            return
        dead_ids = []
        for p_id, p_info in self.rooms[room_id].items():
            if p_id == exclude_id:
                continue
            try:
                await p_info["ws"].send_json(message)
            except Exception:
                dead_ids.append(p_id)
        for p_id in dead_ids:
            self.disconnect(room_id, p_id)

    def update_participant(self, room_id: str, participant_id: str, updates: dict):
        if room_id in self.rooms and participant_id in self.rooms[room_id]:
            self.rooms[room_id][participant_id]["data"].update(updates)
            return self.rooms[room_id][participant_id]["data"]
        return None


manager = RoomConnectionManager()


@router.websocket("/ws/meeting/{room_id}")
async def meeting_websocket_endpoint(
    websocket: WebSocket,
    room_id: str,
    participant_id: str = "guest",
    name: str = "Guest User"
):
    await manager.connect(room_id, participant_id, websocket, name)
    try:
        while True:
            raw_text = await websocket.receive_text()
            try:
                msg = json.loads(raw_text)
            except Exception:
                continue

            msg_type = msg.get("type")

            if msg_type == "chat":
                # Broadcast chat message to everyone in the room
                await manager.broadcast(room_id, {
                    "type": "chat",
                    "message": msg.get("message", {})
                })

            elif msg_type == "reaction":
                # Broadcast emoji reaction to everyone in the room
                await manager.broadcast(room_id, {
                    "type": "reaction",
                    "emoji": msg.get("emoji", "👍"),
                    "sender": msg.get("sender", name)
                })

            elif msg_type == "status_update":
                # Update participant mic, camera, hand, or speaking state
                updates = msg.get("updates", {})
                updated_data = manager.update_participant(room_id, participant_id, updates)
                if updated_data:
                    await manager.broadcast_except(room_id, participant_id, {
                        "type": "participant_updated",
                        "participant": updated_data
                    })

            elif msg_type == "mute_all":
                # Host muted all attendees
                await manager.broadcast_except(room_id, participant_id, {
                    "type": "host_muted_all"
                })

            elif msg_type == "webrtc_offer":
                # Forward SDP offer to target peer
                target_id = msg.get("target_id")
                if target_id and room_id in manager.rooms and target_id in manager.rooms[room_id]:
                    await manager.rooms[room_id][target_id]["ws"].send_json({
                        "type": "webrtc_offer",
                        "sender_id": participant_id,
                        "sdp": msg.get("sdp")
                    })

            elif msg_type == "webrtc_answer":
                # Forward SDP answer to target peer
                target_id = msg.get("target_id")
                if target_id and room_id in manager.rooms and target_id in manager.rooms[room_id]:
                    await manager.rooms[room_id][target_id]["ws"].send_json({
                        "type": "webrtc_answer",
                        "sender_id": participant_id,
                        "sdp": msg.get("sdp")
                    })

            elif msg_type == "webrtc_ice":
                # Forward ICE candidate to target peer
                target_id = msg.get("target_id")
                if target_id and room_id in manager.rooms and target_id in manager.rooms[room_id]:
                    await manager.rooms[room_id][target_id]["ws"].send_json({
                        "type": "webrtc_ice",
                        "sender_id": participant_id,
                        "candidate": msg.get("candidate")
                    })

            elif msg_type == "screen_share_status":
                # Broadcast screen share status
                await manager.broadcast_except(room_id, participant_id, {
                    "type": "screen_share_status",
                    "participant_id": participant_id,
                    "isSharing": msg.get("isSharing", False)
                })

            elif msg_type == "remove_participant":
                target_id = msg.get("target_id")
                if target_id and room_id in manager.rooms and target_id in manager.rooms[room_id]:
                    try:
                        await manager.rooms[room_id][target_id]["ws"].send_json({
                            "type": "removed_by_host"
                        })
                    except Exception:
                        pass
                    manager.disconnect(room_id, target_id)
                    await manager.broadcast(room_id, {
                        "type": "participant_left",
                        "participant_id": target_id
                    })

    except WebSocketDisconnect:
        user_data = manager.disconnect(room_id, participant_id)
        await manager.broadcast(room_id, {
            "type": "participant_left",
            "participant_id": participant_id,
            "name": user_data.get("name") if user_data else name
        })
    except Exception as e:
        logger.error(f"WebSocket error in room {room_id}: {e}")
        user_data = manager.disconnect(room_id, participant_id)
        await manager.broadcast(room_id, {
            "type": "participant_left",
            "participant_id": participant_id,
            "name": user_data.get("name") if user_data else name
        })
