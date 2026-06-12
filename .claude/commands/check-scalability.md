Analyze the indicated module or file exclusively from the perspective of scalability for 100k+ users.

For every problem detected, respond with:

1. **Problem**: what is wrong and why it fails at scale
2. **When it breaks**: at what volume (users, records, RPM, media size) it becomes a real issue
3. **Solution**: concrete implementation recommendation
4. **Priority**: fix now or defer to a later sprint

Always review:

- Pagination: offset vs cursor-based
- Caching: what data should be cached and where
- Queries: selective fields, indexes, limits, joins
- Client renders: how much JavaScript ships to the browser
- Media: optimized images, lazy loading, CDN/object storage
- Real-time: polling vs WebSocket/SSE/queue-based fan-out
- Supabase: RLS overhead, indexes, RPC/transaction needs
- Vercel: edge/serverless execution limits and cold-start risks
