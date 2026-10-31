
 const { Router } = require("express");
 const joinRoomRouter = Router();
 const joinRoomController = require("../controllers/joinRoomController.js");

 joinRoomRouter.post("/", joinRoomController);

 module.exports = joinRoomRouter;
