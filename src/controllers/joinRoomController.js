
const joinRoom = require("../services/joinRoom.js");

async function joinRoomController(req, res) {
const data = req.body;

try {
const result = await joinRoom(data);

if (!result.successful) {
  return res.status(404).json(result);
}

return res.json(result);

} catch (error) {
console.error("Join room error:", error);

return res.status(500).json({
  successful: false,
  message: error.message
});

}
}

module.exports = joinRoomController;
