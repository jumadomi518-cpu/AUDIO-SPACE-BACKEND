
 const rooms = require("../models/rooms.js");

async function resumeConsumer(data) {
  const room = rooms.get(data?.roomId);

  if (!room) {
    return {
      successful: false,
      message: "Room not found"
    };
  }

  const participant = room.participants.get(
    data?.participantId
  );

  if (!participant) {
    return {
      successful: false,
      message: "Participant not found"
    };
  }

  const consumer = participant.consumers.get(
    data?.consumerId
  );

  if (!consumer) {
    return {
      successful: false,
      message: "Consumer not found"
    };
  }

  try {

  await consumer.resume();

  return {
    successful: true,
    consumerId: consumer.id,
    paused: consumer.paused,
    message: "Consumer resumed successfully"
  };
} catch (error) {
  console.error("Resume failed:", error);

  return {
    successful: false,
    message: error.message
  };
}
}

module.exports = resumeConsumer;
