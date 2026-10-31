
  const rooms = require("../models/rooms.js");

 function room(id) {

  const savedRoom = rooms.get(id);

  if (!savedRoom) {
   return { successful: false }
  }

  return {
    successful: true,
    room: {
      ...savedRoom,
      participants: Array.from(
        savedRoom.participants.values()
      )
    }
  };

 }

module.exports = room;
