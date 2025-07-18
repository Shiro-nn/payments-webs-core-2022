var E = function(e) {
    return function(t, n) {
        return void 0 === t && (t = ""),
        void 0 === n && (n = ""),
        (0, B8e)((0, jFuv)(""), (0, hfv)(e(n)), (0, OprQ)(""))(t)
    }
}
var P = E((function(e) {
    return function(t, n) {
        var r = t - e[n];
        return isNaN(r) ? t : r < 0 ? 10 + r : r
    }
}));
const _t = e();
console.log(_t);
console.log(P('111', _t));
function e() {
    var t = (0, nM34)(S, "", new Array(3));
    return "000" === t ? e() : t
}
function S(e) {
    return "" + e + (0, fje(Ihuk).default)(0, 9)
}
function fje(e, t) {
    e.exports = function (e) {
            return e && e.__esModule ? e : {
            default:e}
    },
    e.exports.
default = e.exports,
    e.exports.__esModule = !0
}

function Ihuk(e, t, n) {
    "use strict";
    Object.defineProperty(t, "__esModule", {
        value: !0
    }),
    t.default = function(e, t) {
        var n = 2 * t;
        if (!(isNaN(2 * e) || isNaN(n) || e % Math.floor(e) || t % Math.floor(t) || !(e + 1 <= t) || e instanceof Array || t instanceof Array))
            return Math.floor(Math.random() * (t - e + 1)) + e
    }
}

function nM34(e, t, n) {
    "use strict";
    e.exports = ITDq(3, (function (e, t, n) {
            void 0 === n && (n = []);
            for (var r = n.length, o = 0; o < r; o++) t = e(t, n[o], o, n);
            return t
    }))
}
function ITDq(e, t, n) {
    e.exports = bTjv("ITDq")
}

function bTjv(e, t) {
    //e.exports = vendor_01aa00b98e5d8ff5d41f
}
function B8e(e, t, n) {
    e.exports = bTjv("5B8e")
}

function jFuv(e, t, n) {
    "use strict";
    e.exports = HUpC(2, (function (e, t) {
            return void 0 === e && (e = ""),
            void 0 === t && (t = []),
            (Uoyu(t) ? t : Array.prototype.slice.call(t)).join(e)
    }))
}
function Uoyu(e, t, n) {
    "use strict";
    e.exports = function (e) {
            return !!e && Array.isArray(e)
    }
}
function HUpC(e, t, n) {
    "use strict";
    e.exports = function (e, t) {
            return function n() {
                    for (var r = arguments.length, o = new Array(r), i = 0; i < r; i++) o[i] = arguments[i];
                    return o.length >= e ? t.apply(this, o) : function () {
                            for (var e = arguments.length, t = new Array(e), r = 0; r < e; r++) t[r] = arguments[r];
                            return n.apply(this, o.concat(t))
                    }
            }
    }
}

function hfv(e, t, n) {
    "use strict";
    e.exports = HUpC(2, (function (e, t) {
            void 0 === t && (t = []);
            for (var n = t.length, r = new Array(n), o = 0; o < n; o++) r[o] = e(t[o], o, t);
            return r
    }))
}
function HUpC(e, t, n) {
    "use strict";
    e.exports = function (e, t) {
            return function n() {
                    for (var r = arguments.length, o = new Array(r), i = 0; i < r; i++) o[i] = arguments[i];
                    return o.length >= e ? t.apply(this, o) : function () {
                            for (var e = arguments.length, t = new Array(e), r = 0; r < e; r++) t[r] = arguments[r];
                            return n.apply(this, o.concat(t))
                    }
            }
    }
}

function OprQ(e, t, n) {
    "use strict";
    e.exports = HUpC(2, (function (e, t) {
            return void 0 === e && (e = ""),
            void 0 === t && (t = ""),
            t.split(e)
    }))
}
function HUpC(e, t, n) {
    "use strict";
    e.exports = function (e, t) {
            return function n() {
                    for (var r = arguments.length, o = new Array(r), i = 0; i < r; i++) o[i] = arguments[i];
                    return o.length >= e ? t.apply(this, o) : function () {
                            for (var e = arguments.length, t = new Array(e), r = 0; r < e; r++) t[r] = arguments[r];
                            return n.apply(this, o.concat(t))
                    }
            }
    }
}