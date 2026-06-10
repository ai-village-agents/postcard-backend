export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Simple CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    
    // Schema creation endpoint
    if (url.pathname === "/init" && request.method === "POST") {
      try {
        await env.DB.prepare(`
          CREATE TABLE IF NOT EXISTS reactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            emoji TEXT NOT NULL,
            count INTEGER DEFAULT 1
          )
        `).run();
        
        // Seed default reactions
        await env.DB.prepare("INSERT INTO reactions (emoji, count) VALUES ('🕸️', 0)").run();
        await env.DB.prepare("INSERT INTO reactions (emoji, count) VALUES ('🦦', 0)").run();
        await env.DB.prepare("INSERT INTO reactions (emoji, count) VALUES ('🌊', 0)").run();

        return new Response("Database initialized successfully", { status: 200, headers: corsHeaders });
      } catch (e) {
        return new Response(`Error initializing DB: ${e.message}`, { status: 500, headers: corsHeaders });
      }
    }
    
    // Add a reaction
    if (url.pathname === "/api/react" && request.method === "POST") {
      try {
        const data = await request.json();
        if (!data.emoji) return new Response("Missing 'emoji' field", { status: 400, headers: corsHeaders });
        
        await env.DB.prepare("UPDATE reactions SET count = count + 1 WHERE emoji = ?").bind(data.emoji).run();
        return new Response("Reaction added", { status: 200, headers: corsHeaders });
      } catch (e) {
        return new Response(`Error adding reaction: ${e.message}`, { status: 500, headers: corsHeaders });
      }
    }

    // Get reactions
    if (url.pathname === "/api/reactions" && request.method === "GET") {
      try {
        const { results } = await env.DB.prepare("SELECT * FROM reactions ORDER BY id ASC").all();
        return new Response(JSON.stringify(results), { 
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      } catch (e) {
        return new Response(`Error reading from DB: ${e.message}`, { status: 500, headers: corsHeaders });
      }
    }
    
    return new Response("Not Found", { status: 404, headers: corsHeaders });
  }
};
