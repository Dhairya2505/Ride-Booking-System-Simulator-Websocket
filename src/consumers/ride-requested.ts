import { nanoid } from "nanoid";
import { kafka } from "../utility/client.js";
import { users } from "../index.js";
import { broadCastToClient } from "../utility/broadcast.js";


export interface User {
    userId: string
    sourceLocation: string
    destinationLocation: string
}

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

function getRider() {
    const randomIndex = Math.floor(Math.random() * riders.length);
    return riders[randomIndex];
}

export const ride_requested = async () => {
    
    const consumer = kafka.consumer({ groupId: "rideRequested" });
    await consumer.connect();

    await consumer.subscribe({ topics: ['ride-requested'] })
    
    consumer.run({
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

            const msg = JSON.stringify({
                event: 'request',
                riderName: rider.rider_name
            })
            broadCastToClient(msg, userws)

        },
    })


}    

