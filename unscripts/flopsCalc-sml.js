self.addEventListener('message', function(e){

var data = e.data;
switch (data.cmd) {
	case 'start':
	    weevil_main();
            break;
        case 'stop':
            self.close(); // Terminates the worker.
            break;
}

function weevil_main(){

var mAstr = "[ [0.1,0.2],[0.3,0.4] ]";
var mBstr = "[ [0.456,0.34], [0.78,0.21] ]";

function Matrix(ary) {
    this.mtx = ary
    this.height = ary.length;
    this.width = ary[0].length;
}

var mA = new Matrix(JSON.parse(mAstr));
var mB = new Matrix(JSON.parse(mBstr));
var multCount = 0;

Matrix.prototype.mult = function(other) {
    if (this.width != other.height) {
        throw "error: incompatible sizes";
    }
 
    var result = [];
    for (var i = 0; i < this.height; i++) {
        result[i] = [];
        for (var j = 0; j < other.width; j++) {
            var sum = 0;
            for (var k = 0; k < this.width; k++) {
                sum += this.mtx[i][k] * other.mtx[k][j];
		multCount++;
            }
            result[i][j] = sum;
        }
    }
    return new Matrix(result); 
}

Matrix.prototype.toString = function() {
    var s = []
    for (var i = 0; i < this.mtx.length; i++) 
        s.push( this.mtx[i].join(",") );
    return s.join("\n");
}

var startTime = new Date();

var mR = mA.mult(mB);

var timeInterval = new Date() - startTime;

var flops = (multCount*1000) / timeInterval;

self.postMessage({'time': timeInterval, 'iterations' : multCount, 'flops' : flops});

}
}, false);
