function weevil_main(){

var mAstr = "[ [1,2],[3,4] ]";
var mBstr = "[ [5,6],[7,8] ]";

function Matrix(ary) {
    this.mtx = ary
    this.height = ary.length;
    this.width = ary[0].length;
}

var mA = new Matrix(JSON.parse(mAstr));
var mB = new Matrix(JSON.parse(mBstr));

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

var _sunSpiderStartDate = new Date();

var mR = mA.mult(mB);

var _sunSpiderInterval = new Date() - _sunSpiderStartDate;

return _sunSpiderInterval;

}
