
 const { randomUUID } = require("crypto");
 const rooms = require("../models/rooms.js");
 const { notifyNewParticipant } = require("./realTime.js");
 const { createRoomRouter } = require("./createRoom.js");

async function joinRoom(data) {


  const participantId = randomUUID();
  const room = rooms.get(data?.roomId);

  if (!room) {
   return { successful: false, message: "The Room has expired" }
  }

 if (!room.router || room.router.closed) {
  room.router = await createRoomRouter();
}


  const participant = {
    name: data?.name,
    id: participantId,
    isHost: data?.isHost,
    microphone: "muted",
    hand: "lowered",
    transports: new Map(),
    producers: new Map(),
    consumers: new Map(),
    speaking: false
  }

  const existingParticipant = [...room.participants.values()]
    .find(p => p.id === data.participantId);

  if (existingParticipant) {
    return {
      successful: true,
      participantId: existingParticipant.id,
      rtpCapabilities: room.router.rtpCapabilities
    };
  }

   room.participants.set(participantId, participant);
   notifyNewParticipant(room, participant)

   return {
    successful: true,
    participantId: participantId,
    rtpCapabilities: room.router.rtpCapabilities
   };
 }

module.exports = joinRoom;

