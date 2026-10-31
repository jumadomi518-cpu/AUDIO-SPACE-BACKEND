
 const { randomUUID } = require("crypto");
 const rooms = require("../models/rooms.js");
 const { getWorker } = require("./mediasoup.js");
 const saveRoom = require("../models/saveRoom.js");

 const mediaCodecs = [
  {
    kind: 'audio',
    mimeType: 'audio/opus',
    clockRate: 48000,
    channels: 2
  }
];



async function createRoomRouter() {
  const worker = getWorker();

  return await worker.createRouter({
    mediaCodecs
  });
}

 async function createRoom() {
  const roomId = randomUUID();
  const worker = getWorker();
  const router = await createRoomRouter();

   const room = {
    id: roomId,
    participants: new Map(),
    router: router,
    createdAt: Date.now()
  };

   rooms.set(roomId, room);

try {
  await saveRoom(roomId);
} catch (error) {
  router.close();
  rooms.delete(roomId);
  throw error;
}

 /* setTimeout(() => {
    const existingRoom = rooms.get(roomId);

    if (existingRoom === room) {
      // Close the mediasoup router and its media resources
      if (!router.closed) {
        router.close();
      }

      rooms.delete(roomId);

      console.log(`Room ${roomId} expired after 12 hours`);
    }
  }, 180 * 24 * 60 * 60 * 1000);*/



   return roomId;
 }

module.exports = { createRoom, createRoomRouter };
