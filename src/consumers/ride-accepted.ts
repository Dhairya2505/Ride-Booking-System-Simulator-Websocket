import { users } from "../index.js";
import { broadCastToClient } from "../utility/broadcast.js";
import { kafka } from "../utility/client.js";
import { User } from "./ride-requested.js";


export const ride_accepted = async () => {

    const consumer = kafka.consumer({ groupId: "rideAccepted" });
    await consumer.connect();

    await consumer.subscribe({ topics: ['ride-accepted'] })

    consumer.run({
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

            const msg = JSON.stringify({
                event: 'accepted',
                time: rideTime
            })

            broadCastToClient(msg, userws)



        },
    })


}    