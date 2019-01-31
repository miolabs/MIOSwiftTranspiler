var SwiftIterator = /** @class */ (function () {
    function SwiftIterator(_currentToNext) {
        this._current = 0;
        this._currentToNext = _currentToNext;
    }
    SwiftIterator.prototype.next = function () { return this._currentToNext(this._current++); };
    return SwiftIterator;
}());