
 const rooms = require("../models/rooms.js");
 const connections = require("../models/connections.js");
 const socketRooms = new WeakMap();
 const disconnectTimers = new Map();
 const createWebRtcTransport = require("./createWebRtcTransport.js");
 const connectTransport = require("./connectTransport.js");
 const produce = require("./produce.js");
 const consume = require("./consume.js");
 const resumeConsumer = require("./resumeConsumer.js");
 const removeParticipant = require("./removeParticipant.js");

async function realTime(ws) {
   ws.on("message", async (message) => {
    const data = JSON.parse(message);

    const room = rooms.get(data?.roomId);
    const participant = room?.participants.get(data?.participantId);

    if (data.type === "register") {
      connections.set(data.participantId, ws);

   socketRooms.set(ws, {
    participantId: data.participantId,
    roomId: data.roomId
  });


const timer = disconnectTimers.get(data.participantId);

  if (timer) {
    clearTimeout(timer);
    disconnectTimers.delete(data.participantId);

    console.log("Participant reconnected. Cleanup cancelled.");
  }

      ws.send(JSON.stringify({
        type: "registered",
      }));
    }

    if (data.type === "get-room-state") {
      const room = rooms.get(data.roomId);
      if (room) {
        ws.send(JSON.stringify({
          type: "room-state",
          participants: [...room.participants.values()]
        }));
       console.log("room state sent")
      }


      }

 if (data.type === "createWebRtcTransport") {
  try {
    const result = await createWebRtcTransport(data);

    ws.send(JSON.stringify({
      type: "webRtcTransportCreated",
      ...result
    }));
  } catch (error) {
    ws.send(JSON.stringify({
      type: "error",
      message: error.message
    }));
  }
}


if (data.type === "connectTransport") {
  try {
    const result = await connectTransport(data);

    ws.send(JSON.stringify({
      type: "transportConnected",
      ...result
    }));


  } catch (error) {
    console.error("connectTransport failed:", error);
    ws.send(JSON.stringify({
      type: "error",
      message: error.message
    }));
  }
}



if (data.type === "produce") {
  try {
    const result = await produce(data);

    ws.send(JSON.stringify({
      type: "producerCreated",
      ...result
    }));

if (!result.successful) {
  return;
}


 const room = rooms.get(data.roomId);

    if (!room) {
      console.error("Room not found during notification");
      return;
    }

  // Notify every other participant in the room
 for (const participant of room.participants.values()) {
 /* if (participant.id === data.participantId) {
    continue;
  }*/

  const participantWs = connections.get(participant.id);


  if (participantWs && participantWs.readyState === 1) {
    participantWs.send(JSON.stringify({
      type: "newProducer",
      roomId: data.roomId,
      producerId: result.producerId,
      kind: result.kind,
      participantId: data.participantId
    }));

  }
}


  } catch (error) {
    ws.send(JSON.stringify({
      type: "error",
      message: error.message
    }));
  }
}



if (data.type === "consume") {
  try {
    const result = await consume(data);


    ws.send(JSON.stringify({
      ...result,
      type: "consumerCreated"
    }));


  } catch (error) {
    console.error("Consume handler error:", error);

    ws.send(JSON.stringify({
      type: "error",
      message: error.message
    }));
  }
}


if (data.type === "resumeConsumer") {
  try {
    const result = await resumeConsumer(data);

    ws.send(JSON.stringify({
      type: "consumerResumed",
      ...result
    }));
  } catch (error) {
    ws.send(JSON.stringify({
      type: "error",
      message: error.message
    }));
  }
}


if (data.type === "leave-room") {
  removeParticipant(
    data.roomId,
    data.participantId,
    connections
  );
}

    if (data.type === "microphone") {
      if (participant) {
         participant.microphone = data.status;
        for (const producer of participant.producers.values()) {
  if (producer.kind !== "audio" || producer.closed) continue;

  if (data.status === "muted" && !producer.paused) {
    producer.pause();
  }

  if (data.status === "unmuted" && producer.paused) {
    producer.resume();
  }
}


       for (const [id, p] of room?.participants) {
        const client = connections.get(id);

       if (client?.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: "microphone-update",
          participantId: data.participantId,
          status: data.status
         }));
        console.log("mic update sent")
        }
       }

      }
    }


if (data.type === "speaking-update") {
  const room = rooms.get(data.roomId);

  if (!room) return;

  for (const participant of room.participants.values()) {
    /*if (participant.id === data.participantId) {
      continue;
    }*/

    const client = connections.get(participant.id);

    if (client?.readyState === 1) {
      client.send(JSON.stringify({
        type: "speaking-update",
        participantId: data.participantId,
        speaking: data.speaking
      }));
    }
  }
 console.log("Speaking update sent");
}




 if (data.type === "whiteboard") {
  const room = rooms.get(data.roomId);

  if (!room) {
    console.error(
      "Room not found during whiteboard broadcast:",
      data.roomId
    );
    return;
  }

  console.log("Whiteboard event received by server:", {
    action: data.action,
    roomId: data.roomId,
    participantId: data.participantId,
    participants: room.participants.size
  });

  for (const participant of room.participants.values()) {
    // Do not send the event back to the sender.
    /*if (participant.id === data.participantId) {
      continue;
    }*/

    const participantWs = connections.get(participant.id);

    if (participantWs && participantWs.readyState === 1) {
      participantWs.send(JSON.stringify(data));

      console.log("Whiteboard event sent to:", participant.id);
    } else {
      console.log(
        "Participant WebSocket unavailable:",
        participant.id
      );
    }
  }
}

if (data.type === "getProducers") {

  const room = rooms.get(data.roomId);

  if (!room) return;

  const participant = room.participants.get(data.participantId);

  if (!participant) return;

  const producers = [];

  for (const [otherId, otherParticipant] of room.participants) {

    if (otherId === data.participantId) continue;

    for (const producer of otherParticipant.producers.values()) {

      if (producer.closed) continue;

      producers.push({
        producerId: producer.id,
        participantId: otherId,
        kind: producer.kind
      });

    }
  }

  ws.send(JSON.stringify({
    type: "existingProducers",
    producers
  }));
}


   if (data.type === "hand") {
      if (participant) {
         participant.hand = data.status;
       for (const [id, p] of room?.participants) {
        const client = connections.get(id);

       if (client?.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: "hand-update",
          participantId: data.participantId,
          status: data.status
         }));
        console.log("hand update sent")
        }
       }

      }
    }
   })


ws.on("close", async () => {

  const socketInfo = socketRooms.get(ws);

  if (!socketInfo) return;

  const { participantId, roomId } = socketInfo;

  // Don't remove a newer connection belonging to the same participant.
  if (connections.get(participantId) !== ws) return;

  connections.delete(participantId);

  const room = rooms.get(roomId);

  if (!room) return;

  console.log(`Participant ${participantId} disconnected. Waiting 5 minutes.`);

  // Clear any previous timer for this participant.
  if (disconnectTimers.has(participantId)) {
    clearTimeout(disconnectTimers.get(participantId));
  }

  const timer = setTimeout(() => {

    disconnectTimers.delete(participantId);

    // Check whether the participant reconnected.
    if (connections.has(participantId)) return;

    // Remove the disconnected participant.
    const participant = room.participants.get(participantId);

    if (participant) {

      for (const consumer of participant.consumers.values()) {
        consumer.close();
      }

      for (const producer of participant.producers.values()) {
        producer.close();
      }

      for (const transportEntry of participant.transports.values()) {
        transportEntry.transport.close();
      }

      room.participants.delete(participantId);
    }

    console.log(`Participant ${participantId} removed after 5 minutes.`);

    // Check whether anyone remains connected in this room.
    const hasConnections = [...room.participants.keys()].some(id =>
      connections.has(id)
    );

    if (!hasConnections) {
      console.log(`All participants disconnected. Closing router for ${roomId}`);

      room.router?.close();
      room.router = null;
    }

  }, 5 * 60 * 1000);

  disconnectTimers.set(participantId, timer);

});

 }



function notifyNewParticipant(room, participant) {
  for (const existing of room.participants.values()) {
    const client = connections.get(existing.id);

    if (!client) {
      console.log("No WebSocket found for:", existing.id);
      continue;
    }

    if (client.readyState === 1) {
      client.send(JSON.stringify({
        type: "new-participant",
        participant: {
          id: participant.id,
          name: participant.name,
          isHost: participant.isHost,
          microphone: participant.microphone,
          hand: participant.hand
        }
      }));
    }
  }
}





 module.exports = { notifyNewParticipant, realTime };
