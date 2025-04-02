import { users } from "../index.js";
import { broadCastToClient } from "../utility/broadcast.js";
import { kafka } from "../utility/client.js";
import { User } from "./ride-requested.js";

export const ride_update = async () => {

    const consumer = kafka.consumer({ groupId: "rideUpdate" });

    await consumer.connect();

    await consumer.subscribe({ topics: ['ride-update'] })

    consumer.run({
        eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
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
            } = JSON.parse(message.value?.toString() as string);

            const userws = users.filter((user) => user.userId === details.user.userId)[0].ws

            if(details.time > 0){
                setTimeout( async () => {
                    const producer = kafka.producer()
                    await producer.connect()

                    await producer.send({
                        topic: 'ride-update',
                        messages: [
                            {
                                key: 'ride-update',
                                value: JSON.stringify({
                                    rideId: details.rideId,
                                    rider: details.rider,
                                    user: details.user,
                                    time: details.time-1
                                })
                            }
                        ]
                    })

                    await producer.disconnect()

                }, 1000);

                const msg = JSON.stringify({
                    event: 'update',
                    time: details.time
                })

                broadCastToClient(msg, userws);

            }
            else {

                const msg = JSON.stringify({
                    event: 'complete'
                })

                broadCastToClient(msg, userws)

            }

        }
    })

}