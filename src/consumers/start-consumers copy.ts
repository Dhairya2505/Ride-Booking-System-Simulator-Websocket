import { WebSocket, WebSocketServer } from 'ws'
import { parse } from 'url'
import { nanoid } from 'nanoid'

import { Kafka } from "kafkajs";


const PORT = process.env.PORT || 8080
const server = new WebSocketServer({ port: PORT as number })
const kafka = new Kafka({
    clientId: 'Ride-Book-App',
    brokers: ['localhost:9092'],
})

const consumer1 = kafka.consumer({ groupId: "rideRequested" });
const consumer2 = kafka.consumer({ groupId: "rideAccepted" });

interface User {
    userId: string
    sourceLocation: string
    destinationLocation: string
}

const users: {
    userId: string
    ws: WebSocket | null
}[] = []


const riders = [
    {
        id: "100",
        rider_name: "Rakesh Kulfiwala",
        rides_completed: 0,
        busy: false
    },
    {
        id: "101",
        rider_name: "Mukesh Barfiwala",
        rides_completed: 0,
        busy: false
    },
    {
        id: "102",
        rider_name: "Suresh Mithaiwala",
        rides_completed: 0,
        busy: false
    }
]


server.on("connection", (ws, req) => {
    if (typeof (req.url) != "string") {
        return;
    }
    const params = parse(req.url, true).query;
    const userId = params.userId as string || "Unknown";
    users.push({
        userId,
        ws
    })
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

function getRider() {
    const randomIndex = Math.floor(Math.random() * riders.length);
    return riders[randomIndex];
}

async function init() {

    await consumer1.connect();
    await consumer2.connect();

    await consumer1.subscribe({ topics: ['ride-requested'] })
    await consumer2.subscribe({ topics: ['ride-accepted'] })

    consumer1.run({
        eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {

            const rider = getRider()
            const rideId = nanoid()
            const user: User = JSON.parse(message.value?.toString() as string)

            const producer = kafka.producer();
            await producer.connect();

            await producer.send({
                topic: "ride-accepted",
                messages: [
                    {
                        key: "ride-accepted", value: JSON.stringify({
                            rideId,
                            rider,
                            user
                        })
                    }
                ]
            })

            await producer.disconnect();
            const userId = user.userId;
            const userws = users.filter((user) => user.userId === userId)[0].ws

            broadCastToClient(`Ride accepted -> rider name : ${rider.rider_name}`, userws)

        },
    })

    consumer2.run({
        eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {

            const rideTime = Math.floor(Math.random() * (20 - 10 + 1)) + 10;
            const details: {
                rideId: string
                rider: {
                    id: string
                    rider_name: string
                    rides_completed: number
                    busy: boolean
                }
                user: User
                time: number
            } = {
                ...JSON.parse(message.value?.toString() as string),
                time: rideTime
            }


            const producer = kafka.producer()
            await producer.connect()

            await producer.send({
                topic: 'ride-update',
                messages: [
                    {
                        key: "ride-update",
                        value: JSON.stringify(details)
                    }
                ]
            })

            await producer.disconnect()

            const userws = users.filter((user) => user.userId === details.user.userId)[0].ws

            broadCastToClient(`Ride started, timer : ${rideTime}`, userws)

        },
    })

}

function broadCastToClient(data: string, userws: WebSocket | null){
    server.clients.forEach((client) => {
        if (client == userws) {
            client.send(data)
        }
    })
}

init()