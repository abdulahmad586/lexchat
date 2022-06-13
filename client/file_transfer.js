const { EventEmitter } = require('events');
const fs = require('fs');

class FileTransfer extends EventEmitter {
    constructor(filepath) {
        super();
        this.filepath = filepath;
        this._init();
    }

    _init() {
        fs.readFile(this.filepath, (err, res) => {
            if (err) {
                this.emit("error", err);
            } else {
                this.emit("data", res)
            }
        })
    }

    static async saveBufferToFile(buffer, filename) {
        const dir = "./Downloads/";
        try {
            let folderExists = await fs.existsSync(dir);
            if (!folderExists) {
                await fs.mkdirSync(dir, recursive= true);
            }
    
            fs.writeFile(dir+filename, buffer, function(err) {
                if(err) {
                    return console.log(err);
                }
                // console.log("The file was saved!");
            });
            
        } catch (e) {
            console.log("Error while storing data ", e);
        }
    }

}

module.exports = FileTransfer;