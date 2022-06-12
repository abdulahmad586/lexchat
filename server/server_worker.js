const SockServer = require('./server');
const Constants = require('./../utils/constants');

class ServerWorker {
    constructor() {
        this._initServer();
    }

    _initServer() {
        
        let server = new SockServer(mainContext.hostname, mainContext.port);

        server
            .on('newmsg', data => {
                let { type, from, content, to, time } = data;
                
                switch (type) {
                    case Constants.MessageType.COMMAND:
                        server.processCommand(content, from);
                        break;
                    case Constants.MessageType.MSG_PRIVATE:
                        server.sendPrivate(content, from, to, time);
                        break;
                    case Constants.MessageType.MSG_BROADCAST:
                        server.broadcast(content, from, time);
                        break;
                    default:
                        console.log("Undefined message type detected")

                }

            });
    }

}
module.exports = ServerWorker;