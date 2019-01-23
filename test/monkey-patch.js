Array.prototype.setConditional = function(index, value) {
    if(value == null) this.splice(index, 1)
    else this[index]=value
}
Array.prototype.sortBool = function(iteratee) {
    var _iteratee = function(a, b) {return iteratee(a, b) ? -1 : 1}
    return this.sort(_iteratee)
}
Array.prototype.pushMany = function(items) {
    return this.push.apply(this, items)
}
Array.prototype.pushManyAt = function(items, at) {
    return this.splice.apply(this, [at, 0].concat(items))
}
Array.prototype.enumerated = function() {
    return this.map((v, i) => [i, v])
}
Map.prototype.setConditional = function(index, value) {
    if(value == null) this.delete(index)
    else this.set(index, value)
}
Map.prototype.$struct = true
Array.prototype.$struct = true
Set.prototype.$struct = true
Array.prototype.makeIterator = function() { return new SwiftIterator((current) => this[current]) }
String.prototype.makeIterator = function() { return new SwiftIterator((current) => this[current]) }
Map.prototype.makeIterator = function() { return new SwiftIterator((current) => Array.from(this)[current]) }
var SwiftIterator = /** @class */ (function () {
    function SwiftIterator(_currentToNext) {
        this._current = 0;
        this._currentToNext = _currentToNext;
    }
    SwiftIterator.prototype.next = function () { return this._currentToNext(this._current++); };
    return SwiftIterator;
}());
var Range = /** @class */ (function () {
    function Range(lowerBound, upperBound) {
        this.lowerBound = lowerBound;
        this.upperBound = upperBound;
    }
    Range.prototype.makeIterator = function () {
        var _this = this;
        return new SwiftIterator(function (current) { return _this.includes(current + _this.lowerBound) ? current + _this.lowerBound : null; });
    };
    Range.prototype.includes = function (a) {
        return a >= this.lowerBound && a < this.upperBound;
    };
    return Range;
}());
var ClosedRange = /** @class */ (function () {
    function ClosedRange(lowerBound, upperBound) {
        this.lowerBound = lowerBound;
        this.upperBound = upperBound;
    }
    ClosedRange.prototype.makeIterator = function () {
        var _this = this;
        return new SwiftIterator(function (current) { return _this.includes(current + _this.lowerBound) ? current + _this.lowerBound : null; });
    };
    ClosedRange.prototype.includes = function (a) {
        return a >= this.lowerBound && a <= this.upperBound;
    };
    return ClosedRange;
}());
