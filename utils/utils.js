const Constants = require('./constants');

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

    static sendBuffer(buf, socket) {
        if (socket != undefined /*&& socket.readyState == 'open'*/) {
            try {
                socket.write(buf);
            } catch (e) {
                console.log("Unable to send buffer to sock");
            }
        } else {
            console.log("Unable to send buffer to socket, socket is closed");
        }
    }

    static bufferIsFileTransfer(buf){
        let TRANS_BUFFER = Buffer.from(Constants.FILE_TRANSFER_DELIM);
        let subBuf = buf.subarray(0, TRANS_BUFFER.length);
        return TRANS_BUFFER.compare(subBuf) == 0;
    }

    static parseFileTransferPayload(payload, callback){
        if( !SocketUtils.bufferIsFileTransfer(payload) ){
            callback("Payload is not for transfer", null);
        }else{
            let TRANS_BUFFER = Buffer.from(Constants.FILE_TRANSFER_DELIM);
            let trunc  = payload.subarray(payload.indexOf(Constants.FILE_TRANSFER_UNAME_DELIM)+1, payload.length);
            let sendto = payload.subarray(TRANS_BUFFER.length, payload.indexOf(Constants.FILE_TRANSFER_UNAME_DELIM)).toString();
            if(sendto.startsWith("@")){
                sendto = sendto.replace("@","",0);
            }
            // delete payload;
            callback(null, [sendto,trunc]);
        }
    }

    static write(message) {
        let buf = Buffer.from(message);
        process.stdout.write(buf);
    }

}
module.exports = SocketUtils;