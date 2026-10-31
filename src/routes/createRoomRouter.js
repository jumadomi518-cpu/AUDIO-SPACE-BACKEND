
 const { Router } = require("express");
 const createRoomRouter = Router();
 const createRoomController = require("../controllers/createRoomController.js");

 createRoomRouter.get("/", createRoomController);

 module.exports = createRoomRouter;
