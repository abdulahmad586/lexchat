const Inputer = require('./inputer');
const ClientSock = require('./client-sock');
const FileTransfer = require('./file_transfer');

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
        if (data == null || data == "" || data == "\r" || data == "\n") return;
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
        } else {
            console.log("Server is out of reach");
            this.inp.rl.close();
            setTimeout(() => {
                process.exit(0);
            }, 1000)
        }
    }

    _processServerData(data) {
        // console.log("Data received: "+data.length);
        SocketUtils.parseFileTransferPayload(data, (err, res) => {
            if (err) {
                //if data does not match the file transer protocol
                data = data.toString();
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

                } else {
                    console.log("\n" + data);
                }
            } else {
                //console.log("New file transfer buffer from ", res[0]);
                try {
                    FileTransfer.saveBufferToFile(res[1], res[0]);
                } catch (e) {
                    console.log("An err occurred while saving file ", e);
                }
            }
        });


    }

    setLoggedIn(loggedIn) {
        mainContext.loggedIn = loggedIn;
    }

    _sendFile() {
        this.inp.rl.close();
        let thisClass = this;
        setTimeout(() => {
            let responseGetter = new ResponseGetter();
            responseGetter.getResponse(["File path: ", "To (everyone): "]).then((answers) => {

                if (answers[0] != null && answers[0] != "") {
                    if (answers[1] == null || answers[1] == "") {
                        answers[1] = "*"
                    }

                    console.log("Sending ", answers[0], " to ", answers[1] == "*" ? "Everyone" : answers[i])
                    const transfer = new FileTransfer(answers[0]);
                    transfer
                        .on('error', err => {
                            console.log("FileTransferError: ", err);
                        }).on('data', buf => {
                            let payload = Buffer.concat([Buffer.from(Constants.FILE_TRANSFER_DELIM + answers[1] + Constants.FILE_TRANSFER_UNAME_DELIM), buf]);
                            SocketUtils.sendBuffer(payload, thisClass.serverSock.sSock);
                        })
                }

                this.inp.reinitReadline();
            }).catch((err) => {
                console.log("ERr ", err)
            })
        }, 1000)
    }

}
module.exports = ClientWorker;