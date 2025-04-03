# Ride-Booking-System-Simulator-Websocket

The WebSocket Server in the Ride Booking System Simulator is responsible for managing real-time communication between the backend and frontend. It listens for ride events from Kafka and broadcasts updates to connected clients, ensuring instant status changes. When a ride request is received, the WebSocket server establishes a persistent connection with the frontend, pushing real-time updates such as driver assignment, ride acceptance, and completion. It ensures low-latency, bidirectional communication, allowing users to experience dynamic ride progress. This server acts as a bridge between the Kafka event stream and the frontend, ensuring smooth data flow and real-time interactions.

## Live Demo
- [Link]() (coming soon)

## Screenshots

###### Architecture
![https://dhairyasingla-ride-booking-system-simulator-images.s3.ap-south-1.amazonaws.com/architecture.png](https://dhairyasingla-ride-booking-system-simulator-images.s3.ap-south-1.amazonaws.com/blueprint.png)

## Features
1. **Real-Time Ride Updates** : Streams live ride status changes instantly to connected frontend clients.

2. **Kafka Event Consumption** : Listens to Kafka topics and processes ride-related events efficiently.

3. **Persistent Client Connections** : Maintains active WebSocket connections for seamless bidirectional communication.


## Installation & Setup Instructions

*Note - Start from step 3 if containers are already initialized during backend setup.

1. Initialize a docker container by running the command in cmd:
   `docker run -p 2181:2181 zookeeper`

2. Initialize another container by the following command and replace `<IP ADDRESS>` by your PC's IP Address:
   `docker run -p 9092:9092 -e KAFKA_ZOOKEEPER_CONNECT=<IP ADDRESS>:2181 -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://<IP ADDRESS>:9092 -e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 confluentinc/cp-kafka`

3. Clone the repository to your local machine using the following command:
`git clone https://github.com/Dhairya2505/Ride-Booking-System-Simulator-Websocket.git`

4. Navigate to the project directory : `cd Ride-Booking-System-Simulator-Websocket`

5. Install the dependencies : `npm install`

6. Start the server and consumers : `npm start`.

The server will start on the default port 8080.

That's it! You can now access the websocket server at `ws://localhost:8080/?userId=<id>`.


## Technologies Used

- **Programming Language**: TypeScript
- **Websocket**: For real-time communication between frontend and Kafka events.
- **Node.js**: For running the server-side JavaScript code.
- **Kafka**: For event-driven architecture.

