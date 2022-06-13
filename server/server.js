const net = require('net');
const { EventEmitter } = require('events')
const SocketUtils = require('../utils/utils')
const Constants = require('../utils/constants')

class SockServer extends EventEmitter {

    constructor(host, port) {
        super();
        this.users = {};
        this.usersOnline = 0;
        this.host = host;
        this.port = port;
        this.init();

    }

    init() {
        let mainContext = this;
        let server = net.createServer((clientSocket) => {
            mainContext.usersOnline++;
            let receivedFirstMessage = false;
            let user = Constants.User = {
                color: Constants.generateRandomColor(),
                socket: clientSocket,
                loginTime: Date.now()
            }
            clientSocket
                .on('data', function (data) {
                    if (!receivedFirstMessage) {
                        let uname = data.toString().trim();

                        if (!mainContext.users.hasOwnProperty(uname)) {
                            user.name = uname;
                            mainContext.users[user.name] = user;
                            receivedFirstMessage = true;

                            SocketUtils.sendMessage(`:login ${user.color + user.name}\x1b[0m`, user.socket)
                            setTimeout(() => {
                                SocketUtils.sendMessage(`Hello ${user.name}! there are ${Object.keys(mainContext.users).length} users online at the moment\n`, user.socket)
                            }, 1000)
                        } else {
                            SocketUtils.sendMessage(`Sorry the username you chose '${uname}' is in use by another person, please enter a different username\n\x1b[32mChoose another username\x1b[0m `, user.socket)
                        }

                    } else {

                        mainContext.processDataFromClient(data, user);
                    }
                })

                .on('error', err => {
                    console.log("ClientSocket Error");
                })

                .on('end', function () {
                    mainContext.usersOnline--;
                    if (mainContext.users.hasOwnProperty(user.name)) {
                        delete mainContext.users[user.name]
                    }
                    console.log(`We now have ${mainContext.usersOnline} user(s) online at the moment`)
                })
                .on('close', function (error) {
                    if (error) {
                        mainContext.usersOnline--;
                        if (mainContext.users.hasOwnProperty(user.name)) {
                            delete mainContext.users[user.name]
                        }
                        console.log(`We now have ${mainContext.usersOnline} user(s) online at the moment`)
                        console.log("There was an error with the clients connection");
                    }
                });

            console.log(`User ${clientSocket.remoteAddress} connected to server`);
            setTimeout(() => {
                // SocketUtils.sendMessage(Constants.welcomeMessage(`There are ${mainContext.usersOnline} user(s) online now!\nPlease what is your name?\nNAME: `), clientSocket)
                SocketUtils.sendMessage(Constants.welcomeMessage(''), clientSocket)
            }, 0)
        });
        server.listen(this.port, this.host);
        console.log(`Server running at tcp://${this.host}:${this.port}`);
    }


    broadcastBuffer(buf, sender) {

        let keys = Object.keys(this.users);
        keys.forEach((key) => {
            if (key != sender) {
                SocketUtils.sendBuffer(buf, this.users[key].socket)
            }
        })

    }

    sendPrivateBuffer(buf, from, to) {
        // let date = new Date(time);
        // time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()

        if (this.users.hasOwnProperty(to)) {
            SocketUtils.sendBuf(buf, this.users[to].socket);
        } else {
            //SocketUtils.sendMessage(`${to} is not online`, this.users[from]);
        }
    }

    broadcast(msg, sender, time) {
        if (msg == null || msg == "" || msg == "\r" || msg == "\n") return;
        msg = msg + "\n";
        // console.log("New broadcast message for all ", msg, " From ", sender)
        time = Date.now();
        let date = new Date(time);
        time = date.getHours() + ":" + date.getMinutes()

        let keys = Object.keys(this.users);
        keys.forEach((key) => {
            if (key != sender) {
                SocketUtils.sendMessage(`[${this.users[sender].color + sender}\x1b[0m] \x1b[2m${time}\x1b[0m>> ` + msg, this.users[key].socket)
            }
        })

    }

    sendPrivate(msg, from, to, time) {
        if (msg == null || msg == "" || msg == "\r" || msg == "\n") return;
        msg = msg + "\n";
        time = Date.now();
        let date = new Date(time);
        time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()

        if (this.users.hasOwnProperty(to) && this.users[to].socket != undefined && this.users[to].socket != null) {
            SocketUtils.sendMessage(`[${this.users[from].color + "@" + from}\x1b[0m] \x1b[2m${time}\x1b[0m>>  ` + msg, this.users[to].socket);
        } else {
            console.log("User not found, sending message to ", from);
            SocketUtils.sendMessage(Constants.CONSOLE_COLORS.Red+`${to} is not online\x1b[0m\n`, this.users[from].socket);
        }
    }

    processCommand(commandStr, sender) {
        let command = commandStr.split(" ", 1)[0].toUpperCase();
        switch (command) {
            case "LOGOUT":
                SocketUtils.sendMessage(`[LEXCHAT] :  Have a nice day ${sender}`, this.users[sender].socket);
                setTimeout(() => {
                    if (this.users.hasOwnProperty(sender)) {
                        try {
                            this.users[sender].socket.end();
                        } catch (e) {
                            console.log("Unable to close connection of ", sender, e);
                        }
                    }
                }, 1000)
                break;
            case "USERS":
                let usersList = "";
                let keys = Object.keys(this.users);
                keys.forEach((key) => {
                    usersList += this.users[key].name + "\n";
                })
                SocketUtils.sendMessage(`[*There are ${this.usersOnline} users online]\n${usersList}`, this.users[sender].socket);
                break;
            case "HELP":
                SocketUtils.sendMessage(Constants.HELP_MESSAGE, this.users[sender].socket);
                break;

        }
    }


    processDataFromClient(data, user) {
        let mainContext = this;
        SocketUtils.parseFileTransferPayload(data, (err, res) => {
            if (err) {
                //data is not for file transfer

                data = data.toString().trim();
                let message = Constants.Message = {
                    from: user.name,
                    time: Date.now()
                }

                if (data.startsWith(":")) {
                    message.content = data.replace(":", "", 0);
                    message.type = Constants.MessageType.COMMAND;
                } else if (data.startsWith("@")) {
                    data = data.replace("@", "", 0);
                    message.to = data.split(" ", 1)[0];
                    message.content = data.slice(data.indexOf(" ") + 1);
                    message.type = Constants.MessageType.MSG_PRIVATE;
                } else {
                    message.content = data.trim();
                    message.type = Constants.MessageType.MSG_BROADCAST;
                }
                mainContext.emit("newmsg", message)
                // SocketUtils.sendMessage(`\x1b[32m[${user.name}] >>\x1b[0m `, user.socket)

            } else {
                // console.log("New file transfer buffer from ",user.name);
                if (res[0] == "*") { //send file to everyone
                    this.broadcastBuffer(Buffer.concat([Buffer.from(Constants.FILE_TRANSFER_DELIM + user.name), res[1]]), user.name);
                } else {
                    //send to a specific user
                    this.sendPrivateBuffer(Buffer.concat([Buffer.from(Constants.FILE_TRANSFER_DELIM + user.name), res[1]]), user.name, res[0]);
                }
            }
        })



    }


}
module.exports = SockServer;