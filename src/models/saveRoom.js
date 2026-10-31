

async function saveRoom(roomId) {

 const supabaseModule = await import("../utils/supabase.js");
 const supabase = supabaseModule.default;


const expiresAt = new Date();
expiresAt.setMonth(expiresAt.getMonth() + 6);


  const { data, error } = await supabase
    .from("audio_rooms")
    .insert({
      id: roomId,
      status: "active",
      expires_at: expiresAt.toISOString()
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save room: ${error.message}`);
  }

  return data;
}

module.exports = saveRoom;
