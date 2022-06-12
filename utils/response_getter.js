const Readline = require('readline');
const { promisify } = require('util');

class ResponseGetter {

    constructor() {
        this.rl = new Readline.createInterface({
            input: process.stdin,
            output: process.stdout
        })
    }


    getResponse = promisify(this._getResponse);

    _getResponse(questions, cb, i = 0, answers = []) {
        let thisClass = this;
        try {
            thisClass.rl.question(questions[i], (str) => {

                answers.push(str);
                if (questions.length != answers.length) {
                    i++;
                    return thisClass._getResponse(questions, cb, i, answers)
                } else {
                    thisClass.rl.close();
                    return cb(null, answers);
                }
            })
        } catch (error) {
            console.log("Err ->", error)
        }
    }

}

module.exports = ResponseGetter;