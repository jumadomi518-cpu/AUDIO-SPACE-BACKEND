
const rooms = require("../models/rooms.js");

async function consume(data) {
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

const transportEntry = participant.transports.get(
  data.transportId
);

if (!transportEntry) {
  throw new Error("Transport not found");
}

const transport = transportEntry.transport;

  if (!transport) {
    return {
      successful: false,
      message: "Transport not found"
    };
  }

  const producerParticipant = [
    ...room.participants.values()
  ].find(p => p.producers.has(data?.producerId));

  if (!producerParticipant) {
    return {
      successful: false,
      message: "Producer not found"
    };
  }

  const producer = producerParticipant.producers.get(
    data.producerId
  );

  if (
    !room.router.canConsume({
      producerId: producer.id,
      rtpCapabilities: data?.rtpCapabilities
    })
  ) {
    return {
      successful: false,
      message: "Cannot consume this Producer"
    };
  }

  let consumer;

  try {
    consumer = await transport.consume({
      producerId: producer.id,
      rtpCapabilities: data.rtpCapabilities,
      paused: true
    });

    participant.consumers.set(consumer.id, consumer);

    consumer.on("transportclose", () => {
      participant.consumers.delete(consumer.id);
    });

    consumer.on("producerclose", () => {
      participant.consumers.delete(consumer.id);
    });

    return {
      successful: true,
      consumerId: consumer.id,
      producerId: producer.id,
      kind: consumer.kind,
      rtpParameters: consumer.rtpParameters,
      type: consumer.type,
      producerPaused: consumer.producerPaused
    };
  } catch (error) {
    if (consumer) {
      consumer.close();
    }

    return {
      successful: false,
      message: error.message
    };
  }
}

module.exports = consume;

