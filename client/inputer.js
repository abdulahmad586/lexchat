const Readline = require('readline');
const { EventEmitter } = require('events');

class Inputer extends EventEmitter {
    constructor() {
        super();
        const thisClass = this;
        this.rl = Readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this._getInput();
    }

    _getInput() {
        this.rl.question(mainContext.loggedIn?`\x1b[32m${mainContext.username}\x1b[0m > `:'[\x1b[31mNot Logged in\x1b[0m] ', msg => {
            msg = msg.trim();
            this.emit('message', msg);
            this._getInput();
        });
    }
}

module.exports = Inputer;