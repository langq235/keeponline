var fs = require('fs');
function get() {
    var bitmap = fs.readFileSync('./src/hit.wav');
    return new Buffer(bitmap).toString('base64');
}
console.log(get());