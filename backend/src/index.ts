import { Hono } from 'hono';
import { WhiteboardRoom } from './WhiteboardRoom';

type Bindings = {
	WHITEBOARD_ROOM: DurableObjectNamespace;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get('/', (c) => c.text('Edge Whiteboard API (Durable Objects) is Running!'));

// Route requests to the Durable Object
app.get('/ws/:roomId', async (c) => {
	const roomId = c.req.param('roomId');
	const upgrade = c.req.header('Upgrade');

	if (upgrade !== 'websocket') {
		return c.text('Expected Upgrade: websocket', 426);
	}

	// 1. Get the Unique ID for this room name
	const id = c.env.WHITEBOARD_ROOM.idFromName(roomId);

	// 2. Get the "Stub" (a proxy to the actual object)
	const roomObject = c.env.WHITEBOARD_ROOM.get(id);

	// 3. Forward the request to the object
	return roomObject.fetch(c.req.raw);
});

// IMPORTANT: We must export the class so Cloudflare can find it
export { WhiteboardRoom };

export default app;