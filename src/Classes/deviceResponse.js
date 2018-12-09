
module.exports = class deviceResponse {

    constructor() {
        this.speechText = '';
        this.displayText = '';
        this.repromptText = '';
    }

    clear() {
        this.speechText = '';
        this.displayText = '';
        this.repromptText = '';
    }

    init(values) {
        this.speechText = values.speechText;
        this.displayText = values.displayText;
        this.repromptText = values.repromptText;
    }

    toJSON() {
        return Object.getOwnPropertyNames(this).reduce((a, b) => {
            a[b] = this[b];
            return a;
        }, {});
    }

}
