
const rooms = require("../models/rooms.js");

async function produce(data) {
  const room = rooms.get(data?.roomId);

  if (!room) {
    return { successful: false, message: "Room not found" };
  }

  const participant = room.participants.get(
    data?.participantId
  );

  if (!participant) {
    return { successful: false, message: "Participant not found" };
  }



const transportEntry = participant.transports.get(
  data.transportId
);

if (!transportEntry) {
  throw new Error("Transport not found");
}

const transport = transportEntry.transport;


if (data?.kind === "audio") {
  let openMicrophones = 0;

  for (const peer of room.participants.values()) {
    for (const producer of peer.producers.values()) {
      if (
        producer.kind === "audio" &&
        !producer.closed &&
        !producer.paused
      ) {
        openMicrophones++;
      }
    }
  }

  if (openMicrophones >= 2) {
    return {
      successful: false,
      code: "MIC_LIMIT_REACHED",
      message: "Two microphones are already open."
    };
  }
}




  if (!transport) {
    return { successful: false, message: "Transport not found" };
  }

  try {
    const producer = await transport.produce({
      kind: data?.kind,
      rtpParameters: data?.rtpParameters
    });

    participant.producers.set(producer.id, producer);


    producer.on("transportclose", () => {
      participant.producers.delete(producer.id);
    });

    producer.on("close", () => {
      participant.producers.delete(producer.id);
    });

    return {
      successful: true,
      producerId: producer.id,
      kind: producer.kind
    };
  } catch (error) {
    return {
      successful: false,
      message: error.message
    };
  }
}

module.exports = produce;
