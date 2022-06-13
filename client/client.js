const net = require('net');
const sendMessage = require('../utils/utils');

let PORT = 9090;
let args = process.argv;

let HOST = "localhost";
let NAME = "Shams Khalil";

if (args.length >= 2) {
    HOST = args[2] || "localhost";
}

let serverSocket = net.createConnection(PORT, HOST);
serverSocket
    .on('ready', () => {
        console.log('Connected to server!');
        
    })
    .on('data', (d) => {
        console.log(d.toString());
        sendMessage(NAME, serverSocket)
    })
    .on('error', (err) => {
        console.log("Erorr >>> ", err)
    })