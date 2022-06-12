class SocketUtils {

    static sendMessage(message, socket) {
        if (socket != undefined /*&& socket.readyState == 'open'*/) {
            try {
                let buf = Buffer.from(message);
                socket.write(buf);
            } catch (e) {
                console.log("Unable to send message to sock");
            }
        } else {
            console.log("Unable to send message to socket, socket is closed");
        }
    }

    static write(message) {
        let buf = Buffer.from(message);
        process.stdout.write(buf);
    }

}
module.exports = SocketUtils;