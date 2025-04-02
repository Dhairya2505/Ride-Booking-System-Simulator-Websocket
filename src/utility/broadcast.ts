import WebSocket from "ws"
import { server } from "../index.js"

export function broadCastToClient(data: string, userws: WebSocket | null){
    if(userws){
        server.clients.forEach((client) => {
            if (client == userws) {
                client.send(data)
            }
        })
    }
}