import { Kafka } from "kafkajs";

export const kafka = new Kafka({
    clientId: 'Ride-Book-App',
    brokers: ['localhost:9092'],
})