

 const room = require("../services/room.js");

 function roomController(req, res) {

  const result = room(req.params.roomId);
  res.json(result);

 }

 module.exports = roomController;
