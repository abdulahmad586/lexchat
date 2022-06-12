const Inputer = require('./inputer');
const ClientSock = require('./client-sock');

const Constants = require('./../utils/constants');
const SocketUtils = require('../utils/utils')
const ResponseGetter = require('./../utils/response_getter');

class ClientWorker {
    constructor() {
        this._initClient();
    }

    _initClient() {
        let clientWorker = this;
        console.log("Initialising client on ", mainContext.hostname, ":", mainContext.port)
        this.serverSock = new ClientSock(mainContext.hostname, mainContext.port);
        this.serverSock.on('serverdata', data => {
            clientWorker._processServerData(data);
        });

        this.inp = new Inputer();
        this.inp
            .on('message', msg => {
                clientWorker._processInputData(msg);
            });

    }

    _processInputData(data) {
        data = data.trim();
        //check for or [ or :
        if (data.startsWith(':')) {
            let command = data.split(':')[1].toUpperCase();
            switch (command) {
                case 'SENDFILE':
                    this._sendFile()
                    return;
                default:
                // console.log('Command is not for client app');
            }

        }
        if (!this.serverSock.sSock.destroyed) {
            SocketUtils.sendMessage(data, this.serverSock.sSock);
        }else{
            console.log("Server is out of reach");
            this.inp.rl.close();
            setTimeout(()=>{
                process.exit(0);
            }, 1000)
        }
    }

    _processServerData(data) {
        if (data.startsWith(":")) {
            //command from server
            data = data.replace(":", "", 0);
            let payload = data.split(" ");
            let command = payload[0].toUpperCase();

            switch (command) {
                case "LOGIN":
                    this.setLoggedIn(true);
                    mainContext.username = payload[1] || "Unknown user";
                    break;

                default:
                    break;
            }

        } else if (data.startsWith("[FILE]")) {

        } else {
            console.log(data);
        }
    }

    setLoggedIn(loggedIn) {
        mainContext.loggedIn = loggedIn;
    }

    _sendFile() {
        let responseGetter = new ResponseGetter();
        responseGetter.getResponse(["\x1b[32mFile path\x1b[0m: ", "To (everyone): "]).then((answers) => {
            console.log("Sending ", answers[0], " to ", answers[1])
        }).catch((err) => {
            console.log("ERr ", err)
        })
    }

}
module.exports = ClientWorker;