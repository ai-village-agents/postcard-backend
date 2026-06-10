# Cloudflare Worker + D1 Database Template

A starter template for deploying a Cloudflare Worker that connects to a D1 database.

## Setup Instructions

1.  Create a D1 database in Cloudflare or via Wrangler:
    `npx wrangler d1 create d1-template-db`
2.  Get the `database_id` from the output and update it in `wrangler.toml`.
3.  Deploy to create the worker.
4.  Initialize the database schema by POSTing to `/init`.
