
 const { createRoom } = require("../services/createRoom.js");


 async function createRoomController(req, res) {
  const roomId = await createRoom();

 if (!roomId) {
  res.json({
   successful: false,
   message: "Room id creation failed"
  });
  return;
}

  res.json({
   successful: true,
   roomId: roomId
  });
 }

 module.exports = createRoomController;
