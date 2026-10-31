
const mediasoup = require("mediasoup");

let worker;

async function startMediasoup() {
  worker = await mediasoup.createWorker({
    rtcMinPort: 40000,
    rtcMaxPort: 49999
  });

  worker.on("died", () => {
    console.error("Mediasoup worker died");
    process.exit(1);
  });

  console.log("Mediasoup worker started");

  return worker;
}

function getWorker() {
  if (!worker) {
    throw new Error("Mediasoup worker has not been initialized");
  }

  return worker;
}

module.exports = {
  startMediasoup,
  getWorker
};
