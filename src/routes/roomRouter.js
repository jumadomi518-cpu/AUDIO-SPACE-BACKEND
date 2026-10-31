
 const { Router } = require("express");
 const roomRouter = Router();

 const roomController = require("../controllers/roomController.js");

 roomRouter.get("/", roomController);

 module.exports = roomController;
