class Constants {

    static welcomeMessage(str) {
        return `******************\n*      WELCOME TO LEXCHAT      *\n******************
        ${str}`;
    }

    static HELP_MESSAGE = `
\x1b[1mLEXCHAT HELP\x1b[0m
\x1b[2mLexChat is a chatting app implemented using Node's socket utilities from the 'net' package.
The program can be run as a server or a client in a single instance, by specifying \x1b[32m1\x1b[0m for running
as a server, or \x1b[32m2\x1b[0m for connecting to an existing server using their IP address and Port number.

CHAT PROTOCOL
While using the LexChat Client, all messages sent through the interface will be sent as \x1b[32mbroadcast\x1b[0m messages to 
allother clients connected to the same server, except in cases where the user needs to send a \x1b[32mprivate message\x1b[0m 
to another user or a \x1b[32mcommand\x1b[0m to the server.
    
PRIVATE MESSAGE
Use this format to send a private message to a user that is online

\x1b[1m@username message\x1b[0m

Example: @JohnDoe Hello John how are you doing today?

COMMANDS
Always precede commands with a colon (:), these are the available list of commands

    \x1b[1m:logout\x1b[0m -> to logout from the server
    \x1b[1m:users\x1b[0m -> to get a list of users that are online
    \x1b[1m:help\x1b[0m -> to print this help page

    `;

    static FILE_TRANSFER_DELIM = ":FILE_BUFFER";
    static FILE_TRANSFER_UNAME_DELIM = "|";

    static ConnectionType = {
        SERVER: 1,
        CLIENT: 2
    }

    static MessageType = {
        COMMAND: 1,//starts with an *
        MSG_BROADCAST: 2,//normal text
        MSG_PRIVATE: 3,//starts with @ followed by the persons name
    }

    static User = {
        name: 'Anon_' + Date.now().toString().substr(5, 10),
        color:null,
        socket: null,
        loginTime: null,
    };

    static Message = {
        from: null,
        to: null,
        type: null,
        content: null,
        time: null,
    }

    static CONSOLE_COLORS = {
        Red: "\x1b[31m",
        Green:"\x1b[32m",
        Yellow:"\x1b[33m",
        Blue:"\x1b[34m",
        Magenta:"\x1b[35m",
        Cyan:"\x1b[36m",
        White:"\x1b[37m",
    };
    
    static generateRandomColor(){
        const colors = Object.keys(this.CONSOLE_COLORS);
        return this.CONSOLE_COLORS[colors[Math.floor(Math.random()*colors.length)]];
    }

}
module.exports = Constants;