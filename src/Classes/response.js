
const _attributesClass = require('../Classes/attributes');
const _deviceResponseClass = require('../Classes/deviceResponse');

let _attributes = new _attributesClass();
let _deviceResponse = new _deviceResponseClass();

module.exports = class response {

    constructor() {
        this.attributes = _attributes;
        this.deviceResponse = _deviceResponse;
        this.errorMessage = '';
    }

    clear() {
        this.attributes = _attributes.clear();
        this.deviceResponse = _deviceResponse.clear();
        this.errorMessage = '';
    }

    init(attributes, deviceResponse) {
        this.attributes = attributes;
        this.deviceResponse = deviceResponse;
    }

    toJSON() {
        return Object.getOwnPropertyNames(this).reduce((a, b) => {
            a[b] = this[b];
            return a;
        }, {});
    }

}
