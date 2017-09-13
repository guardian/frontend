@(page: model.Page)(implicit context: model.ApplicationContext)

  ! function(t) {
        function r(n) {
            if (e[n]) return e[n].exports;
            var o = e[n] = {
                i: n,
                l: !1,
                exports: {}
            };
            return t[n].call(o.exports, o, o.exports, r), o.l = !0, o.exports
        }
        var e = {};
        r.m = t, r.c = e, r.d = function(t, e, n) {
            r.o(t, e) || Object.defineProperty(t, e, {
                configurable: !1,
                enumerable: !0,
                get: n
            })
        }, r.n = function(t) {
            var e = t && t.__esModule ? function() {
                return t.default
            } : function() {
                return t
            };
            return r.d(e, "a", e), e
        }, r.o = function(t, r) {
            return Object.prototype.hasOwnProperty.call(t, r)
        }, r.p = "", r(r.s = 0)
    }([function(t, r, e) {
        "use strict"
    }]);
! function(t) {
    function r(n) {
        if (e[n]) return e[n].exports;
        var o = e[n] = {
            i: n,
            l: !1,
            exports: {}
        };
        return t[n].call(o.exports, o, o.exports, r), o.l = !0, o.exports
    }
    var e = {};
    r.m = t, r.c = e, r.d = function(t, e, n) {
        r.o(t, e) || Object.defineProperty(t, e, {
            configurable: !1,
            enumerable: !0,
            get: n
        })
    }, r.n = function(t) {
        var e = t && t.__esModule ? function() {
            return t.default
        } : function() {
            return t
        };
        return r.d(e, "a", e), e
    }, r.o = function(t, r) {
        return Object.prototype.hasOwnProperty.call(t, r)
    }, r.p = "", r(r.s = 0)
}([function(t, r, e) {
    "use strict"
}]);
! function(n) {
    function t(r) {
        if (e[r]) return e[r].exports;
        var u = e[r] = {
            i: r,
            l: !1,
            exports: {}
        };
        return n[r].call(u.exports, u, u.exports, t), u.l = !0, u.exports
    }
    var e = {};
    t.m = n, t.c = e, t.d = function(n, e, r) {
        t.o(n, e) || Object.defineProperty(n, e, {
            configurable: !1,
            enumerable: !0,
            get: r
        })
    }, t.n = function(n) {
        var e = n && n.__esModule ? function() {
            return n.default
        } : function() {
            return n
        };
        return t.d(e, "a", e), e
    }, t.o = function(n, t) {
        return Object.prototype.hasOwnProperty.call(n, t)
    }, t.p = "", t(t.s = 1)
}([function(n, t, e) {
    "use strict";
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    var r = function() {
        function n(n, t) {
            var e = [],
                r = !0,
                u = !1,
                o = void 0;
            try {
                for (var i, c = n[Symbol.iterator](); !(r = (i = c.next()).done) && (e.push(i.value), !t || e.length !== t); r = !0);
            } catch (n) {
                u = !0, o = n
            } finally {
                try {
                    !r && c.return && c.return()
                } finally {
                    if (u) throw o
                }
            }
            return e
        }
        return function(t, e) {
            if (Array.isArray(t)) return t;
            if (Symbol.iterator in Object(t)) return n(t, e);
            throw new TypeError("Invalid attempt to destructure non-iterable instance")
        }
    }();
    t.chan = u, t.putAsync = o, t.takeAsync = i, t.map = c, t.filter = f, t.apply = a, t.merge = l, t.dropRepeats = p, t.take = v, t.drop = d, t.tap = m;
    var u = function() {
            var n = !1,
                t = void 0,
                e = function() {
                    return o() ? ["resume", t] : n ? ["resume", null] : ["park", null]
                },
                r = function(e) {
                    return n ? ["resume", !1] : u() ? (t = e, ["resume", !0]) : ["park", null]
                },
                u = function() {
                    return !0
                },
                o = function() {
                    return !!t
                },
                i = function() {
                    n = !0
                },
                c = function(n) {
                    return n(f)
                },
                f = Object.freeze({
                    take: e,
                    put: r,
                    canPut: u,
                    canTake: o,
                    "->": c,
                    close: i,
                    isClosed: n
                });
            return f
        },
        o = function(n) {
            return function(t) {
                return new Promise(function(e) {
                    ! function r() {
                        var u = t.put(n);
                        "resume" === u[0] ? e(u[1]) : setTimeout(r, 0)
                    }()
                })
            }
        },
        i = function(n) {
            return new Promise(function(t) {
                ! function e() {
                    var r = n.take();
                    "resume" === r[0] ? t(r[1]) : setTimeout(e, 0)
                }()
            })
        },
        c = function(n) {
            return function(t) {
                var e = u();
                return function r() {
                    i(t).then(function(t) {
                        null === t ? e.close() : (e.put(n(t)), r())
                    })
                }(), e
            }
        },
        f = function(n) {
            return function(t) {
                var e = u();
                return function r() {
                    i(t).then(function(t) {
                        null === t ? e.close() : (n(t) && e.put(t), r())
                    })
                }(), e
            }
        },
        a = function(n) {
            return function(t) {
                var e = u();
                return function u() {
                    Promise.all([i(n), i(t)]).then(function(n) {
                        var t = r(n, 2),
                            o = t[0],
                            i = t[1];
                        null === o || null === i ? e.close() : (e.put(o(i)), u())
                    })
                }(), e
            }
        },
        l = function(n) {
            return function(t) {
                var e = u(),
                    r = function n(t) {
                        i(t).then(function(r) {
                            null === r || (e.put(r), n(t))
                        })
                    };
                return r(n), r(t), e
            }
        },
        s = function(n) {
            var t = r(n, 2);
            return t[0] === t[1]
        },
        p = function(n) {
            var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : s,
                e = u();
            return function r() {
                i(n).then(function(n) {
                    null === n ? e.close() : (t([n, void 0]) || e.put(n), r())
                })
            }(), e
        },
        v = function(n) {
            return function(t) {
                var e = u();
                return function n(r) {
                    0 === r ? e.close() : i(t).then(function(t) {
                        null === t ? e.close() : (e.put(t), n(r - 1))
                    })
                }(n), e
            }
        },
        d = function(n) {
            return function(t) {
                var e = u();
                return function n(r) {
                    i(t).then(function(t) {
                        null === t ? e.close() : 0 === r ? (e.put(t), n(0)) : n(r - 1)
                    })
                }(n), e
            }
        },
        m = function(n) {
            return function(t) {
                ! function e() {
                    i(t).then(function(t) {
                        null !== t && (n(t), e())
                    })
                }()
            }
        }
}, function(n, t, e) {
    "use strict";
    Object.defineProperty(t, "__esModule", {
        value: !0
    }), t.default = function(n) {
        var t = n.ophan,
            e = n.dom,
            i = void 0,
            c = function(n) {
                return i = (0, o.fromEvent)("click", n.question)["->"]((0, u.filter)(function(n) {
                    return n.target.classList.contains(".button")
                }))["->"]((0, u.map)(function(n) {
                    return "like" === n.target.value ? r.Like : r.Dislike
                }))["->"]((0, u.take)(1)), (0, u.tap)(a(n))(i), Promise.resolve()
            },
            f = function() {
                i.close()
            },
            a = function(n) {
                return function(r) {
                    t.record({
                        atomId: n.snippetId,
                        component: "snippet_" + n.snippetType,
                        value: n.snippetType + "_feedback_" + r
                    }), e.write(function() {
                        n.ack.hidden = !1, n.question.hidden = !0
                    })
                }
            };
        return function(n) {
            var t = function() {
                var t = n.querySelector(".atom--snippet__feedback"),
                    e = n.querySelector(".atom--snippet__ack"),
                    r = n.querySelector(".atom--snippet");
                return t && e && r ? Object.freeze({
                    atomId: n.id,
                    snippetId: r.dataset.snippetId,
                    snippetType: r.dataset.snippetType,
                    question: t,
                    ack: e,
                    start: c,
                    stop: f
                }) : "Some elements were missing when initialising atom"
            };
            return Object.freeze({
                runTry: t
            })
        }
    };
    var r, u = e(0),
        o = e(2);
    ! function(n) {
        n.Like = "like", n.Dislike = "dislike"
    }(r || (r = {}))
}, function(n, t, e) {
    "use strict";
    Object.defineProperty(t, "__esModule", {
        value: !0
    }), t.fromEvent = void 0;
    var r = e(0);
    t.fromEvent = u;
    var u = function(n, t) {
        var e = (0, r.chan)();
        return t.addEventListener(n, function(n) {
            (0, r.putAsync)(n)(e)
        }), e
    }
}]);
! function(t) {
    function r(n) {
        if (e[n]) return e[n].exports;
        var o = e[n] = {
            i: n,
            l: !1,
            exports: {}
        };
        return t[n].call(o.exports, o, o.exports, r), o.l = !0, o.exports
    }
    var e = {};
    r.m = t, r.c = e, r.d = function(t, e, n) {
        r.o(t, e) || Object.defineProperty(t, e, {
            configurable: !1,
            enumerable: !0,
            get: n
        })
    }, r.n = function(t) {
        var e = t && t.__esModule ? function() {
            return t.default
        } : function() {
            return t
        };
        return r.d(e, "a", e), e
    }, r.o = function(t, r) {
        return Object.prototype.hasOwnProperty.call(t, r)
    }, r.p = "", r(r.s = 0)
}([function(t, r, e) {
    "use strict"
}]);