var swfobject = function () {
    function a() {
        if (P)
            return;
        try {
            var h = t.getElementsByTagName("body")[0].appendChild(C("span"));
            h.parentNode.removeChild(h)
        } catch (j) {
            return
        }
        P = true;
        var l = V.length;
        for (var o = 0; o < l; o++)
            V[o]()
    }

    function e(h) {
        if (P)
            h();
        else
            V[V.length] = h
    }

    function b(h) {
        if (typeof J.addEventListener != A)
            J.addEventListener("load", h, false);
        else if (typeof t.addEventListener != A)
            t.addEventListener("load", h, false);
        else if (typeof J.attachEvent != A)
            Q(J, "onload", h);
        else if (typeof J.onload == "function") {
            var j = J.onload;
            J.onload = function () {
                j();
                h()
            }
        } else
            J.onload = h
    }

    function d() {
        if (ca)
            c();
        else
            f()
    }

    function c() {
        var h = t.getElementsByTagName("body")[0];
        var j = C(L);
        j.setAttribute("type", W);
        var l = h.appendChild(j);
        if (l) {
            var o = 0;
            (function () {
                    if (typeof l.GetVariable != A) {
                        var q = l.GetVariable("$version");
                        if (q) {
                            q = q.split(" ")[1].split(",");
                            p.pv = [parseInt(q[0], 10), parseInt(q[1], 10), parseInt(q[2], 10)]
                        }
                    } else if (o < 10) {
                        o++;
                        setTimeout(arguments.callee, 10);
                        return
                    }
                    h.removeChild(j);
                    l = null;
                    f()
                })()
        } else
            f()
    }

    function f() {
        var h = N.length;
        if (h >
            0)
            for (var j = 0; j < h; j++) {
                var l = N[j].id;
                var o = N[j].callbackFn;
                var q = {
                    success: false,
                    id: l
                };
                if (p.pv[0] > 0) {
                    var u = B(l);
                    if (u)
                        if (K(N[j].swfVersion) && !(p.wk && p.wk < 312)) {
                            I(l, true);
                            if (o) {
                                q.success = true;
                                q.ref = g(l);
                                o(q)
                            }
                        } else if (N[j].expressInstall && m()) {
                            var v = {};
                            v.data = N[j].expressInstall;
                            v.width = u.getAttribute("width") || "0";
                            v.height = u.getAttribute("height") || "0";
                            if (u.getAttribute("class"))
                                v.styleclass = u.getAttribute("class");
                            if (u.getAttribute("align"))
                                v.align = u.getAttribute("align");
                            var D = {};
                            var x = u.getElementsByTagName("param");
                            var H = x.length;
                            for (var E = 0; E < H; E++)
                                if (x[E].getAttribute("name").toLowerCase() != "movie")
                                    D[x[E].getAttribute("name")] = x[E].getAttribute("value");
                            k(v, D, l, o)
                        } else {
                            n(u);
                            if (o)
                                o(q)
                        }
                } else {
                    I(l, true);
                    if (o) {
                        var F = g(l);
                        if (F && typeof F.SetVariable != A) {
                            q.success = true;
                            q.ref = F
                        }
                        o(q)
                    }
                }
            }
    }

    function g(h) {
        var j = null;
        var l = B(h);
        if (l && l.nodeName == "OBJECT")
            if (typeof l.SetVariable != A)
                j = l;
            else {
                var o = l.getElementsByTagName(L)[0];
                if (o)
                    j = o
            }
        return j
    }

    function m() {
        return !X && K("6.0.65") && (p.win || p.mac) && !(p.wk && p.wk < 312)
    }

    function k(h,
               j, l, o) {
        X = true;
        aa = o || null;
        da = {
            success: false,
            id: l
        };
        var q = B(l);
        if (q) {
            if (q.nodeName == "OBJECT") {
                T = r(q);
                Y = null
            } else {
                T = q;
                Y = l
            }
            h.id = ea;
            if (typeof h.width == A || !/%$/.test(h.width) && parseInt(h.width, 10) < 310)
                h.width = "310";
            if (typeof h.height == A || !/%$/.test(h.height) && parseInt(h.height, 10) < 137)
                h.height = "137";
            t.title = t.title.slice(0, 47) + " - Flash Player Installation";
            var u = p.ie && p.win ? "ActiveX" : "PlugIn";
            var v = "MMredirectURL=" + J.location.toString().replace(/&/g, "%26") + "&MMplayerType=" + u + "&MMdoctitle=" + t.title;
            if (typeof j.flashvars !=
                A)
                j.flashvars += "&" + v;
            else
                j.flashvars = v;
            if (p.ie && p.win && q.readyState != 4) {
                var D = C("div");
                l += "SWFObjectNew";
                D.setAttribute("id", l);
                q.parentNode.insertBefore(D, q);
                q.style.display = "none";
                (function () {
                        if (q.readyState == 4)
                            q.parentNode.removeChild(q);
                        else
                            setTimeout(arguments.callee, 10)
                    })()
            }
            y(h, j, l)
        }
    }

    function n(h) {
        if (p.ie && p.win && h.readyState != 4) {
            var j = C("div");
            h.parentNode.insertBefore(j, h);
            j.parentNode.replaceChild(r(h), j);
            h.style.display = "none";
            (function () {
                    if (h.readyState == 4)
                        h.parentNode.removeChild(h);
                    else
                        setTimeout(arguments.callee, 10)
                })()
        } else
            h.parentNode.replaceChild(r(h), h)
    }

    function r(h) {
        var j = C("div");
        if (p.win && p.ie)
            j.innerHTML = h.innerHTML;
        else {
            var l = h.getElementsByTagName(L)[0];
            if (l) {
                var o = l.childNodes;
                if (o) {
                    var q = o.length;
                    for (var u = 0; u < q; u++)
                        if (!(o[u].nodeType == 1 && o[u].nodeName == "PARAM") && !(o[u].nodeType == 8))
                            j.appendChild(o[u].cloneNode(true))
                }
            }
        }
        return j
    }

    function y(h, j, l) {
        var o;
        var q = B(l);
        if (p.wk && p.wk < 312)
            return o;
        if (q) {
            if (typeof h.id == A)
                h.id = l;
            if (p.ie && p.win) {
                var u = "";
                for (var v in h)
                    if (h[v] !=
                        Object.prototype[v])
                        if (v.toLowerCase() == "data")
                            j.movie = h[v];
                        else if (v.toLowerCase() == "styleclass")
                            u += ' class="' + h[v] + '"';
                        else if (v.toLowerCase() != "classid")
                            u += " " + v + '="' + h[v] + '"';
                var D = "";
                for (var x in j)
                    if (j[x] != Object.prototype[x])
                        D += '<param name="' + x + '" value="' + j[x] + '" />';
                q.outerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"' + u + ">" + D + "</object>";
                Z[Z.length] = h.id;
                o = B(h.id)
            } else {
                var H = C(L);
                H.setAttribute("type", W);
                for (var E in h)
                    if (h[E] != Object.prototype[E])
                        if (E.toLowerCase() ==
                            "styleclass")
                            H.setAttribute("class", h[E]);
                        else if (E.toLowerCase() != "classid")
                            H.setAttribute(E, h[E]);
                for (var F in j)
                    if (j[F] != Object.prototype[F] && F.toLowerCase() != "movie")
                        z(H, F, j[F]);
                q.parentNode.replaceChild(H, q);
                o = H
            }
        }
        return o
    }

    function z(h, j, l) {
        var o = C("param");
        o.setAttribute("name", j);
        o.setAttribute("value", l);
        h.appendChild(o)
    }

    function w(h) {
        var j = B(h);
        if (j && j.nodeName == "OBJECT")
            if (p.ie && p.win) {
                j.style.display = "none";
                (function () {
                        if (j.readyState == 4)
                            G(h);
                        else
                            setTimeout(arguments.callee, 10)
                    })()
            } else
                j.parentNode.removeChild(j)
    }

    function G(h) {
        var j = B(h);
        if (j) {
            for (var l in j)
                if (typeof j[l] == "function")
                    j[l] = null;
            j.parentNode.removeChild(j)
        }
    }

    function B(h) {
        var j = null;
        try {
            j = t.getElementById(h)
        } catch (l) {
        }
        return j
    }

    function C(h) {
        return t.createElement(h)
    }

    function Q(h, j, l) {
        h.attachEvent(j, l);
        R[R.length] = [h, j, l]
    }

    function K(h) {
        var j = p.pv;
        var l = h.split(".");
        l[0] = parseInt(l[0], 10);
        l[1] = parseInt(l[1], 10) || 0;
        l[2] = parseInt(l[2], 10) || 0;
        return j[0] > l[0] || j[0] == l[0] && j[1] > l[1] || j[0] == l[0] && j[1] == l[1] && j[2] >= l[2] ? true : false
    }

    function U(h, j, l,
               o) {
        if (p.ie && p.mac)
            return;
        var q = t.getElementsByTagName("head")[0];
        if (!q)
            return;
        var u = l && typeof l == "string" ? l : "screen";
        if (o) {
            M = null;
            ba = null
        }
        if (!M || ba != u) {
            var v = C("style");
            v.setAttribute("type", "text/css");
            v.setAttribute("media", u);
            M = q.appendChild(v);
            if (p.ie && p.win && typeof t.styleSheets != A && t.styleSheets.length > 0)
                M = t.styleSheets[t.styleSheets.length - 1];
            ba = u
        }
        if (p.ie && p.win) {
            if (M && typeof M.addRule == L)
                M.addRule(h, j)
        } else if (M && typeof t.createTextNode != A)
            M.appendChild(t.createTextNode(h + " {" + j + "}"))
    }

    function I(h,
               j) {
        if (!fa)
            return;
        var l = j ? "visible" : "hidden";
        if (P && B(h))
            B(h).style.visibility = l;
        else
            U("#" + h, "visibility:" + l)
    }

    function ga(h) {
        var j = /[\\\"<>\.;]/;
        var l = j.exec(h) != null;
        return l && typeof encodeURIComponent != A ? encodeURIComponent(h) : h
    }

    var A = "undefined";
    var L = "object";
    var ha = "Shockwave Flash";
    var la = "ShockwaveFlash.ShockwaveFlash";
    var W = "application/x-shockwave-flash";
    var ea = "SWFObjectExprInst";
    var ia = "onreadystatechange";
    var J = window;
    var t = document;
    var O = navigator;
    var ca = false;
    var V = [d];
    var N = [];
    var Z =
        [];
    var R = [];
    var T;
    var Y;
    var aa;
    var da;
    var P = false;
    var X = false;
    var M;
    var ba;
    var fa = true;
    var p = function () {
        var h = typeof t.getElementById != A && typeof t.getElementsByTagName != A && typeof t.createElement != A;
        var j = O.userAgent.toLowerCase();
        var l = O.platform.toLowerCase();
        var o = l ? /win/.test(l) : /win/.test(j);
        var q = l ? /mac/.test(l) : /mac/.test(j);
        var u = /webkit/.test(j) ? parseFloat(j.replace(/^.*webkit\/(\d+(\.\d+)?).*$/, "$1")) : false;
        var v = !+"\u000b1";
        var D = [0, 0, 0];
        var x = null;
        if (typeof O.plugins != A && typeof O.plugins[ha] ==
            L) {
            x = O.plugins[ha].description;
            if (x && !(typeof O.mimeTypes != A && O.mimeTypes[W] && !O.mimeTypes[W].enabledPlugin)) {
                ca = true;
                v = false;
                x = x.replace(/^.*\s+(\S+\s+\S+$)/, "$1");
                D[0] = parseInt(x.replace(/^(.*)\..*$/, "$1"), 10);
                D[1] = parseInt(x.replace(/^.*\.(.*)\s.*$/, "$1"), 10);
                D[2] = /[a-zA-Z]/.test(x) ? parseInt(x.replace(/^.*[a-zA-Z]+(.*)$/, "$1"), 10) : 0
            }
        } else if (typeof J.ActiveXObject != A)
            try {
                var H = new ActiveXObject(la);
                if (H) {
                    x = H.GetVariable("$version");
                    if (x) {
                        v = true;
                        x = x.split(" ")[1].split(",");
                        D = [parseInt(x[0], 10),
                            parseInt(x[1], 10), parseInt(x[2], 10)]
                    }
                }
            } catch (E) {
            }
        return {
            w3: h,
            pv: D,
            wk: u,
            ie: v,
            win: o,
            mac: q
        }
    }
    ();
    var na = function () {
        if (!p.w3)
            return;
        if (typeof t.readyState != A && t.readyState == "complete" || typeof t.readyState == A && (t.getElementsByTagName("body")[0] || t.body))
            a();
        if (!P) {
            if (typeof t.addEventListener != A)
                t.addEventListener("DOMContentLoaded", a, false);
            if (p.ie && p.win) {
                t.attachEvent(ia, function () {
                        if (t.readyState == "complete") {
                            t.detachEvent(ia, arguments.callee);
                            a()
                        }
                    }
                );
                if (J == top)
                    (function () {
                            if (P)
                                return;
                            try {
                                t.documentElement.doScroll("left")
                            } catch (h) {
                                setTimeout(arguments.callee,
                                    0);
                                return
                            }
                            a()
                        })()
            }
            if (p.wk)
                (function () {
                        if (P)
                            return;
                        if (!/loaded|complete/.test(t.readyState)) {
                            setTimeout(arguments.callee, 0);
                            return
                        }
                        a()
                    })();
            b(a)
        }
    }
    ();
    var oa = function () {
        if (p.ie && p.win)
            window.attachEvent("onunload", function () {
                    var h = R.length;
                    for (var j = 0; j < h; j++)
                        R[j][0].detachEvent(R[j][1], R[j][2]);
                    var l = Z.length;
                    for (var o = 0; o < l; o++)
                        w(Z[o]);
                    for (var q in p)
                        p[q] = null;
                    p = null;
                    for (var u in swfobject)
                        swfobject[u] = null;
                    swfobject = null
                }
            )
    }
    ();
    return {
        registerObject: function (h, j, l, o) {
            if (p.w3 && h && j) {
                var q = {};
                q.id = h;
                q.swfVersion =
                    j;
                q.expressInstall = l;
                q.callbackFn = o;
                N[N.length] = q;
                I(h, false)
            } else if (o)
                o({
                    success: false,
                    id: h
                })
        },
        getObjectById: function (h) {
            if (p.w3)
                return g(h)
        },
        embedSWF: function (h, j, l, o, q, u, v, D, x, H) {
            var E = {
                success: false,
                id: j
            };
            if (p.w3 && !(p.wk && p.wk < 312) && h && j && l && o && q) {
                I(j, false);
                e(function () {
                        l += "";
                        o += "";
                        var F = {};
                        if (x && typeof x === L)
                            for (var ja in x)
                                F[ja] = x[ja];
                        F.data = h;
                        F.width = l;
                        F.height = o;
                        var S = {};
                        if (D && typeof D === L)
                            for (var ka in D)
                                S[ka] = D[ka];
                        if (v && typeof v === L)
                            for (var $ in v)
                                if (typeof S.flashvars != A)
                                    S.flashvars +=
                                        "&" + $ + "=" + v[$];
                                else
                                    S.flashvars = $ + "=" + v[$];
                        if (K(q)) {
                            var ma = y(F, S, j);
                            if (F.id == j)
                                I(j, true);
                            E.success = true;
                            E.ref = ma
                        } else if (u && m()) {
                            F.data = u;
                            k(F, S, j, H);
                            return
                        } else
                            I(j, true);
                        if (H)
                            H(E)
                    }
                )
            } else if (H)
                H(E)
        },
        switchOffAutoHideShow: function () {
            fa = false
        },
        ua: p,
        getFlashPlayerVersion: function () {
            return {
                major: p.pv[0],
                minor: p.pv[1],
                release: p.pv[2]
            }
        },
        hasFlashPlayerVersion: K,
        createSWF: function (h, j, l) {
            if (p.w3)
                return y(h, j, l);
            else
                return undefined
        },
        showExpressInstall: function (h, j, l, o) {
            if (p.w3 && m())
                k(h, j, l, o)
        },
        removeSWF: function (h) {
            if (p.w3)
                w(h)
        },
        createCSS: function (h, j, l, o) {
            if (p.w3)
                U(h, j, l, o)
        },
        addDomLoadEvent: e,
        addLoadEvent: b,
        getQueryParamValue: function (h) {
            var j = t.location.search || t.location.hash;
            if (j) {
                if (/\?/.test(j))
                    j = j.split("?")[1];
                if (h == null)
                    return ga(j);
                var l = j.split("&");
                for (var o = 0; o < l.length; o++)
                    if (l[o].substring(0, l[o].indexOf("=")) == h)
                        return ga(l[o].substring(l[o].indexOf("=") + 1))
            }
            return ""
        },
        expressInstallCallback: function () {
            if (X) {
                var h = B(ea);
                if (h && T) {
                    h.parentNode.replaceChild(T, h);
                    if (Y) {
                        I(Y, true);
                        if (p.ie && p.win)
                            T.style.display =
                                "block"
                    }
                    if (aa)
                        aa(da)
                }
                X = false
            }
        }
    }
}
();
