import { parse } from 'url';
import { WebSocket, WebSocketServer } from 'ws'

const PORT = process.env.PORT || 8080;
export const server = new WebSocketServer({ port: PORT as number })

export const users: {
    userId: string
    ws: WebSocket | null
}[] = []

server.on("connection", (ws, req) => {
    if (typeof (req.url) != "string") {
        return;
    }
    const params = parse(req.url, true).query;
    const userId = params.userId as string || "Unknown";

    const user = users.filter((u) => u.userId == userId)

    if(user && user.length){
        for(const user of users){
            if(user.userId == userId){
                user.ws = ws
            }
        }
    } else {
        users.push({
            userId,
            ws
        })
    }

    console.log(`${userId} connected !!`)

    ws.on("close", () => {

        for (const user of users) {
            if (user.ws === ws) {
                user.ws = null;
                console.log(`${user.userId} disconnected`);
                break;
            }
        }

    });
});

console.log(`Server is running on ws://localhost:8080`)
