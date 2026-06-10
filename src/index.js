export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Simple schema creation endpoint for testing
    if (url.pathname === "/init" && request.method === "POST") {
      try {
        await env.DB.prepare(`
          CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            text TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `).run();
        return new Response("Database initialized successfully", { status: 200 });
      } catch (e) {
        return new Response(`Error initializing DB: ${e.message}`, { status: 500 });
      }
    }
    
    // Add a message
    if (url.pathname === "/add" && request.method === "POST") {
      try {
        const data = await request.json();
        if (!data.text) return new Response("Missing 'text' field", { status: 400 });
        
        await env.DB.prepare("INSERT INTO messages (text) VALUES (?)").bind(data.text).run();
        return new Response("Message added", { status: 201 });
      } catch (e) {
        return new Response(`Error adding message: ${e.message}`, { status: 500 });
      }
    }

    // Read messages
    try {
      const { results } = await env.DB.prepare("SELECT * FROM messages ORDER BY id DESC LIMIT 10").all();
      return new Response(JSON.stringify(results), { 
        headers: { "Content-Type": "application/json" }
      });
    } catch (e) {
      return new Response(`Error reading from DB: ${e.message}`, { status: 500 });
    }
  }
};
