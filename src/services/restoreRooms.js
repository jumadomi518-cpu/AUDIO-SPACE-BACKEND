
const rooms = require("../models/rooms.js");
const { createRoomRouter } = require("./createRoom.js");

async function restoreRooms() {

 const supabaseModule = await import("../utils/supabase.js");
 const supabase = supabaseModule.default;


const { error: updateError } = await supabase
  .from("audio_rooms")
  .update({ status: "expired" })
  .lte("expires_at", new Date().toISOString())
  .eq("status", "active");

if (updateError) {
  throw new Error(`Failed to update expired rooms: ${updateError.message}`);
}

const { data: savedRooms, error } = await supabase
  .from("audio_rooms")
  .select("id, expires_at")
  .eq("status", "active")
  .gt("expires_at", new Date().toISOString());


  if (error) {
    throw new Error(`Failed to load rooms: ${error.message}`);
  }

  for (const savedRoom of savedRooms) {
    if (rooms.has(savedRoom.id)) continue;

    const router = await createRoomRouter();

    const room = {
      id: savedRoom.id,
      participants: new Map(),
      router,
    };

    rooms.set(savedRoom.id, room);

    console.log(`Restored room: ${savedRoom.id}`);
  }

  console.log(`Restored ${savedRooms.length} saved rooms`);
}

module.exports = restoreRooms;
