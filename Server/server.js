const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const path = require('path');

const { Storage } = require('@google-cloud/storage');
const storage = new Storage({
    keyFilename: path.join(__dirname, 'service-account-key.json'), // Replace with the correct path to your service account key file
});

const bucketName = 'alumi-space'; // Replace with your Google Cloud Storage bucket name
const dataFileName = 'drawing-data.json';
const messageHistoryFileName = 'message-history.json';
const visitsFileName = 'visits.json';
const PORT = process.env.PORT || 8081;

let visits = 0;

let messageHistory = [];

let drawingData = [];


let online = 0;

async function readDataFromFile(fileName) {
    try {
        const [file] = await storage.bucket(bucketName).file(fileName).download();
        const rawData = file.toString('utf-8');
        if (rawData.trim() !== '') {
            return JSON.parse(rawData);
        }
    } catch (error) {
        console.error('Error reading data from file:', error);
    }
    return [];
}

async function writeDataToFile(fileName, data) {
    try {
        await storage.bucket(bucketName).file(fileName).save(JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error writing data to file:', error);
    }
}

async function increaseVisitCount(fileName) {
    if(!loaded) return;
    try {
        visits++;
        const data = {visits}
        await storage.bucket(bucketName).file(fileName).clear;
        await storage.bucket(bucketName).file(fileName).save(JSON.stringify(data, null, 2));

    } catch (error) {
        console.error('Error writing data to file:', error);
    }
}

async function createFilesIfNotExist() {
    try {
        await storage.bucket(bucketName).file(dataFileName).download();
    } catch (error) {
        if (error.code === 404) {
            console.log(`${dataFileName} not found. Creating a new file.`);
            await writeDataToFile(dataFileName, []);
        } else {
            console.error('Error checking file:', error);
        }
    }

    try {
        await storage.bucket(bucketName).file(messageHistoryFileName).download();
    } catch (error) {
        if (error.code === 404) {
            console.log(`${messageHistoryFileName} not found. Creating a new file.`);
            await writeDataToFile(messageHistoryFileName, []);
        } else {
            console.error('Error checking file:', error);
        }
    }

    try {
        await storage.bucket(bucketName).file(visitsFileName).download();
    } catch (error) {
        if (error.code === 404) {
            console.log(`${visitsFileName} not found. Creating a new file.`);
            await writeDataToFile(visitsFileName, [{visits: 0}]);
        } else {
            console.error('Error checking file:', error);
        }
    }
}

let loaded = false;
async function loadInitialData() {
    await createFilesIfNotExist();
    messageHistory = await readDataFromFile(messageHistoryFileName);
    drawingData = await readDataFromFile(dataFileName);
    const visitsData = await readDataFromFile(visitsFileName);
    console.log(visitsData);
    if(visitsData.visits == null) visits = 0;
    else visits = (Number)(visitsData.visits);

    loaded = true;
}

loadInitialData();


io.on('connection', socket => {

    socket.emit('loadDrawing', drawingData);
    socket.emit("loadMessages", messageHistory);

    socket.on('draw', (data) => {
        drawingData.push(data);
        if(drawingData.length > 20000){
            drawingData.splice(0,1);
        }
        socket.broadcast.emit('draw', data);

    });

    socket.on('stop-drawing', ()=>{
        writeDataToFile(dataFileName, drawingData);
    });

    socket.on('reload', () => {
        socket.emit('loadDrawing', drawingData);
    });

    socket.on("send-message", (username, message, date) => {
        if(message.includes("/clear_message")){
            const num = parseInt(message.charAt(message.length-1));

            for(let i = 0; i < num; i++){
                messageHistory.pop();
            }
            socket.emit("loadMessages", messageHistory);
            writeDataToFile(messageHistoryFileName, messageHistory);
        }

        else if(message === "/clear_image"){
            console.log("clear CLEAR CLEAR CLEAR")
            drawingData=[];
            writeDataToFile(dataFileName, drawingData);
            io.emit("clear");
            socket.broadcast.emit("receive-message", username, message, date);
            messageHistory.push({username, message, date});
        }
        else {
            socket.broadcast.emit("receive-message", username, message, date);
            messageHistory.push({username, message, date});
        }

        if (messageHistory.length > 500) {
            messageHistory.splice(0, 1);
        }

        writeDataToFile(messageHistoryFileName, messageHistory);
    });

    socket.on("join-room", room => {
        leaveAllRooms(socket);
        socket.join(room)
    });

    socket.on("user-join", ()=>{
        increaseVisitCount(visitsFileName);
        io.emit("user-count", visits);
        online++;
        io.emit("online-count", Math.floor(io.sockets.server.engine.clientsCount/2));
        console.log("visits: "+visits);
    })

    socket.on("disconnect", ()=> {
        io.emit("online-count", Math.floor(io.sockets.server.engine.clientsCount/2));
    })
});

function leaveAllRooms(socket) {
    const rooms = Object.keys(socket.rooms);
    rooms.forEach((room) => {
        // Exclude the default room (socket.id) from leaving
        if (room !== socket.id) {
            socket.leave(room);
            console.log(`Socket left room: ${room}`);
        }
    });
}

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../Client')));

// Route for serving the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../Client/index.html'));
});

server.listen(PORT, () => {
    console.log('listening on :' + PORT);
});
