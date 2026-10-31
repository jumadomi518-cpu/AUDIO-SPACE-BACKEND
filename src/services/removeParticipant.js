const rooms = require("../models/rooms.js");

function removeParticipant(roomId, participantId, connections) {
  const room = rooms.get(roomId);

  if (!room) return;

  const participant = room.participants.get(participantId);

  if (!participant) return;

  // Close consumers
  for (const consumer of participant.consumers.values()) {
    consumer.close();
  }

  // Close producers
  for (const producer of participant.producers.values()) {
    producer.close();
  }

  // Close transports
  for (const entry of participant.transports.values()) {
    entry.transport.close();
  }

  // Remove participant from room
  room.participants.delete(participantId);

  // Remove active WebSocket connection
  connections.delete(participantId);

  // Notify remaining participants
  for (const peer of room.participants.values()) {
    const client = connections.get(peer.id);

    if (client && client.readyState === 1) {
      client.send(JSON.stringify({
        type: "participantLeft",
        participantId
      }));
    }
  }

  console.log(`Participant ${participantId} left room ${roomId}`);

  // Delete empty room
  if (room.participants.size === 0 && room.router) {
  room.router.close();
  room.router = null;

  console.log("Router closed; room ID preserved:", room.id);
}

}

module.exports = removeParticipant;
