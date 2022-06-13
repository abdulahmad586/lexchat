const Constants = require('./utils/constants')
const FileTransfer = require('./client/file_transfer')
const fs = require('fs');

let ft = new FileTransfer('./TransferThisFile.txt');


// ft.on('data', data => {
//     //console.log(data.toString());
//     storeData(data, "./downloaded_file.txt");
// }).on('error', error => {

// })

