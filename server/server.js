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
                            
                            SocketUtils.sendMessage(`Hello ${user.name}! there are ${Object.keys(mainContext.users).length} users online at the moment\n\r`, user.socket)
                            SocketUtils.sendMessage(`:login ${user.name}`, user.socket)
                        } else {
                            SocketUtils.sendMessage(`Sorry the username you chose '${uname}' is in use by another person, please enter a different username\n\x1b[32mChoose another username\x1b[0m `, user.socket)
                        }

                    } else {
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

    broadcast(msg, sender, time) {
        msg = msg + "\n";
        // console.log("New broadcast message for all ", msg, " From ", sender)
        time = Date.now();
        let date = new Date(time);
        time = date.getHours() + ":" + date.getMinutes()

        let keys = Object.keys(this.users);
        keys.forEach((key) => {
            if (key != sender) {
                SocketUtils.sendMessage(`[${sender}] \x1b[2m${time}\x1b[0m>> ` + msg, this.users[key].socket)
            }
        })

    }

    sendPrivate(msg, from, to, time) {
        msg = msg + "\n";
        time = Date.now();
        let date = new Date(time);
        time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()

        if (this.users.hasOwnProperty(to)) {
            SocketUtils.sendMessage(`[@${from}] \x1b[2m${time}\x1b[0m>>  ` + msg, this.users[from]);
        } else {
            SocketUtils.sendMessage(`${to} is not online`, this.users[from]);
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
                SocketUtils.sendMessage(`[There are ${this.usersOnline} users online]\n${usersList}`, this.users[sender].socket);
                break;
            case "HELP":
                SocketUtils.sendMessage(Constants.HELP_MESSAGE, this.users[sender].socket);
                break;

        }
    }

}
module.exports = SockServer;