# lexchat
LexChat is a chatting app implemented using Node's socket utilities from the 'net' package.
The program can be run as a server or a client in a single instance, by specifying 1 for running
as a server, or 2 for connecting to an existing server using their IP address and Port number.

CHAT PROTOCOL
While using the LexChat Client, all messages sent through the interface will be sent as broadcast messages to 
allother clients connected to the same server, except in cases where the user needs to send a private message 
to another user or a command to the server.
    
PRIVATE MESSAGE
Use this format to send a private message to a user that is online

@username message

Example: @JohnDoe Hello John how are you doing today?

COMMANDS
Always precede commands with a colon (:), these are the available list of commands

    node app.js
    
    :logout // to logout from the server
    :users // to get a list of users that are online
    :help // to print this help page
    :sendfile //to transfer a file to any or all users online
