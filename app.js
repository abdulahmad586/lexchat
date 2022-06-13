const ServerWorker = require('./server/server_worker');
const ClientWorker = require('./client/client_worker');
const ResponseGetter = require('./utils/response_getter');
const SocketUtils = require('./utils/utils');
const Constants = require('./utils/constants');

SocketUtils.write("*Welcome to LexChat App\n\nYou may either run this app as a \x1b[1mserver\x1b[0m or join another server as a \x1b[1mclient\x1b[0m\n");

responseGetter = new ResponseGetter();
mainContext = this;
responseGetter.getResponse(["\x1b[33m1\x1b[0m=Host Server | \x1b[32m2\x1b[0m=Join as Client: ", "Hostname (0.0.0.0): ", "Port (9090): "]).then((answers) => {
    mainContext.connectionType = parseInt(answers[0]) || 1;//connection defaults to host server
    mainContext.hostname = answers[1] == "" ? "0.0.0.0" : answers[1]; //hostname defaults to local host if no input is supplied
    mainContext.port = parseInt(answers[2]) || 9090;//port number defaults to 9090 if the user enters an unrecognised number
    if (mainContext <= 1024 || mainContext > 65535) {
        mainContext = 9090;
        console.log("Sorry, custom TCP port numbers should be between 1024 and 65535, using ", mainContext);
    }
    init();

}).catch((err) => {
    console.log("Err >> ", err)
})

function init() {
    if (mainContext.connectionType == Constants.ConnectionType.SERVER) {
        new ServerWorker();
    } else if (mainContext.connectionType == Constants.ConnectionType.CLIENT) {
        // mainContext.username = "Anon_"+Math.random();//if no username is supplied the program generates a random username
        // new ClientWorker();
        responseGetter = new ResponseGetter();
        responseGetter.getResponse(["\x1b[32mChoose a username\x1b[0m: ", "Press 'Enter' to login"]).then((answers) => {
            mainContext.username = answers[0] =="" || answers[0] == undefined ? "Anon_"+Math.ceil(Math.random() * 1000):answers[0];//if no username is supplied the program generates a random username
            console.log("username: ", mainContext.username)
            new ClientWorker();
        }).catch((err) => {
            console.log("ERr ", err)
        })
    }
}