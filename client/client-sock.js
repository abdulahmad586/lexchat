const net = require('net');
const { EventEmitter } = require('events');
const SocketUtils = require('../utils/utils')

class ClientSock extends EventEmitter {
    constructor(host, port) {
        super();
        this.sSock = net.createConnection(port, host);
        this.sSock
            .on('ready', () => {
                console.log('Connected to Server!');
                console.log('Logging in as ', mainContext.username)
                SocketUtils.sendMessage(mainContext.username, this.sSock);
            })
            .on('data', (data) => {
                
                this.emit('serverdata', data);
            })
            .on('error', err => {
                console.log('Server Socket Error >> ', err);
            });
    }
}

module.exports = ClientSock;