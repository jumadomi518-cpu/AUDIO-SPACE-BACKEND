
const rooms = require("../models/rooms.js");

async function createWebRtcTransport(data) {
  const room = rooms.get(data.roomId);

  if (!room) {
    throw new Error("Room not found");
  }

  const participant = room.participants.get(
    data.participantId
  );

  if (!participant) {
    throw new Error("Participant not found");
  }

  const transport = await room.router.createWebRtcTransport({
    listenInfos: [
      {
        protocol: "udp",
        ip: "0.0.0.0",
        announcedAddress: process.env.ANNOUNCED_IP
      }
    ]
  });

console.log("Transport created:", {
  id: transport.id,
  iceState: transport.iceState,
  dtlsState: transport.dtlsState,
  iceCandidates: transport.iceCandidates
});


transport.on("icestatechange", (state) => {
  console.log("ICE STATE:", transport.id, state);
});

transport.on("dtlsstatechange", (state) => {
  console.log("DTLS STATE:", transport.id, state);
});

transport.on("iceselectedtuplechange", (tuple) => {
  console.log("ICE SELECTED TUPLE:", tuple);
});

  participant.transports.set(transport.id, {
    transport,
    direction: data.direction
  });

  return {
    id: transport.id,
    direction: data.direction,
    iceParameters: transport.iceParameters,
    iceCandidates: transport.iceCandidates,
    dtlsParameters: transport.dtlsParameters
  };
}

module.exports = createWebRtcTransport;

