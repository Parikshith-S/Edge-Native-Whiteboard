import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
	return c.text('Edge Whiteboard API is Running!')
})

export default app