
// final innerHTML behaves like buffered innerHTML and not like streamed document.write
// That is acceptable.

if(/generate_expected=1/.test(location.href)) {
  window.expectedBehavior = false;
}

if(/wait=1/.test(location.href)) {
  // wait before running tests.
  test('waiting', stop);
}

var GENERATE_EXPECTED = !window.expectedBehavior;

var testOptions = {};

var defaultOptions = {
};

var ignoreScripts = (function() {
  var div = document.createElement('div');
  var html = '<SCRIPT TYPE="text/javascript" SRC="remote/write-div.js"></SCRIPT>';
  div.innerHTML = html;
  return div.innerHTML.indexOf(html) === -1;
}());

var innerHtml = function(el) {
  //return el.innerHTML.replace(/(\r\n)?<script[^>]*>[\s\S]*?<\/script>(\r\n)?/ig, '');
  var html = el.innerHTML
    .replace(/\.js\?0\.\d+/g, '.js')
    // The contents of iframes gets doubly-escaped because we pass the expected value through innerHTML.
    // So we ignore it.
    .replace(/(<iframe[^>]*>)[\s\S]*?(<\/iframe>)/ig, '$1$2');
  return ignoreScripts ?
    // remove all scripts (IE7/8, FF)
    // IE7/8 because we pass expected html through the innerHTML of a div, scripts don't appear
    // FF reverses order of attributes in the case that SRC is capitalized.
    html.replace(/(\r\n)?<script[^>]*>[\s\S]*?<\/script>(\r\n)?/ig, '') :
    // only remove helper scripts
    // Webkit, IE9
    html.replace(/<script class="test_helper">.*?<\/script>/g, '');
};

window.nativeBehavior = {};

if(!window.console) {
  window.console = {log: function(){}};
}
// reverse the first two arguments of equal
var qunitEqual = equal;

var getDoc = function(iframe) {
  return iframe.contentWindow.document;
};

var qunitEqual = window.equal;
window.equal = function(x, y, msg) {
  return qunitEqual(y, x, msg);
};

var ifrId = 0;

var IFrame = function(id) {
  var ifr = document.createElement('iframe');

  ifr.setAttribute('id', 'ifr' + (ifrId++));

  // append it to dom so we can get the document
  document.body.appendChild(ifr);
  ifr.doc = getDoc(ifr);

  // write a content div
  ifr.doc.write('<html><body><h3>'+id+'</h3>');

  ifr.doc._write = ifr.doc.write;
  ifr.doc._writeln = ifr.doc.writeln;

  ifr.doc.write = function() {
    ifr.doc._write.apply(ifr.doc, [].slice.call(arguments));
  }

  ifr.doc.writeln = function() {
    var args = [].slice.call(arguments);
    args.push('\n');
    ifr.doc.write.apply(ifr.doc, args);
  }

  ifr.doc.writeInline = function(js) {
    this.write('<script>'+js+'</script>');
  };

  ifr.doc.writeRemote = function(url) {
    this.write('<script src="'+url+'"></script>');
  };

  ifr.doc.callbackId = 0;
  ifr.doc.writeCallback = function(fn, msg) {
    ifr.doc.callbackId++;
    var cbName = 'cb_'+ifr.doc.callbackId;
    ifr.contentWindow[cbName] = fn;
    ifr.doc.write('<script class="test_helper">'+cbName+'();//'+msg+'</script>');
  };

  return ifr;
};

var PauseMonitor = function(done) {
  var timeout;
  var self = {

    contexts: [],

    // ctx's interface: resume method + paused boolean attribute.
    add: function(ctx) {
      self.contexts.push(ctx);

      // override ctx's resume method
      var resume = ctx.resume;
      ctx.resume = function() {
        // call ctx's old resume method
        resume.apply(ctx, arguments);
        self.checkDone();
      };
    },


    checkDone: function () {
      clearTimeout(timeout);
      // check if we're done on next tick.
      timeout = setTimeout(function() {
        for(var i = 0, ctx; ctx = self.contexts[i]; i++) {
          if(ctx.paused) {
            return;
          }
        }
        console.log('=== all contexts are done ===');
        done();
        done = null;
      }, 0);
    }

  };

  return self;
};


// a tag is a function that takes a document context
var execute = function(name, tags, options) {
  random.reset();

  console.log('\n\ntest start '+name);
  var tag, i;
  for(var i = 0, tag; tag = tags[i]; i++) {
    tag.id = 'tag'+i;
  }

  var ifr, mode, pauseMonitor;

  var Context = {
    common: function(tag) {
      var doc = getDoc(ifr);

      var self = tag[mode+'Ctx'] = {

        tag: tag,

        mode: mode,

        doc: doc,

        div: doc.getElementById(tag.id),

        written: '',

        pause: function() {
          console.log('ctx paused');
          self.paused = true;
        },

        resume: function() {
          console.log('ctx resumed');
          self.paused = false;
        },

        onFinished: function() {
          self.eq(innerHtml(self.div), tag.id+':Final InnerHtml');
          console.log(tag.id+' finished');
        },

        render: function renderTest() {
          console.log(tag.id+' starting');
          self.tag.render(self);
          self.pause();
          self.writeCallback(function() {
            self.onFinished();
            self.resume();
          }, 'Rendering Complete');
        },

        compareInnerHtml: function() {
          self.eqPrefix(innerHtml(self.div), tag.id+':'+[].slice.call(arguments).join(''));
        }

      };

      var delegateMethod = function(method) {
        self[method] = function() {
          return doc[method].apply(doc, arguments);
        };
      };
      var method, methods = 'write writeln writeInline writeRemote writeCallback'.split(' ');
      while(method = methods.pop()) {
        delegateMethod(method);
      }

      return self;
    },

    native: function(tag){

      var self = Context.common(tag);

      self.calls = [];

      self.eq = function(val, msg) {
        self.calls.push([].slice.call(arguments));
      };

      self.eqPrefix = function(val, msg) {
        self.calls.push([].slice.call(arguments));
      };

      self.expect = function(){
        // do nothing
      };

      var parser = htmlParser('', {
        autoFix: true
      });

      self.doc.write = function() {
        var args = [].slice.call(arguments);
        console.log('native docwrite', args);

        if(parser) {
          $.each(args, function(index, value) {
            parser.append(value);
          });
          args = (function() {
            var str = '';
            for(var tok; tok = parser.readToken();) {
              str += tok.text;
            }
            return [str];
          })();
        }

        //TODO(dbrans): Add comment explaining why this is commented out.
        //str = str.replace(/\.js/g, '.js?'+Math.random());

        $.each(args, function(index, value) {
          self.written = self.written + value;
        });

        if(options.useInnerHtml) {
          self.div.innerHTML = self.written;
        } else {
          self.doc._write.apply(self.doc, args);
        }
        self.compareInnerHtml.apply(self, args);
      };

      return self;
    },


    writer: function(tag){

      var self = Context.common(tag);
      var work = self.doc.createElement('div');

      var expectCalls;

      if(expectedBehavior) {  //$.browser.msie || $.browser.mozilla && parseFloat($.browser.version) < 2 ) {
        expectCalls = expectedBehavior['test '+name][tag.id].calls;

      } else {
        expectCalls = [].slice.call(tag.nativeCtx.calls);
      }

      self.expect = function(expects) {

      };

      // Remove first \r\n from actual (needed for IE7-8)
      function clipRN(str) {
        return str.replace(/^\r\n/, "");
      }

      self.eq = function(val, msg) {
        var args = expectCalls.shift();

        if(args && expectedBehavior) {
          // run it through innerHTML to get rid of browser inconsistencies
          work.innerHTML = args[0];
          args[0] = innerHtml(work);
        }

        if(!args) {
          args = ['args was null', 'args was null'];
        } else if (args[1] !== msg) {
          msg = 'mismatch: 1:' + args[1] + ' 2:'+msg;
        }

        if(args[0] !== val) {
          console.log('\nTest Fail', msg);
        }

        equal(args[0], clipRN(val), msg);
      };

      // writer should have at least what native has.
      self.eqPrefix = function(val, msg) {
        var args = expectCalls.shift();

        if(args && expectedBehavior) {
          // run it through innerHTML to get rid of browser inconsistencies
          work.innerHTML = args[0];
          args[0] = innerHtml(work);
        }

        if(!args) {
          args = ['args was null', 'args was null'];
        } else if (args[1] !== msg) {
          msg = 'mismatch: 1:' + args[1] + ' 2:'+msg;
        }


        if(val.indexOf(args[0]) !== 0) {
          if(args[0] !== clipRN(val)) {
            console.log('\nTest Fail', msg);
          }
          equal(args[0], clipRN(val), msg);
        } else {
          ok(true, msg);
        }
      };


      return self;
    }
  };

  var renderTag = function(tag) {
    var ctx = Context[mode](tag, ifr.doc);
    pauseMonitor.add(ctx);
    ctx.render();
  };

  // pause the qunit test
  stop();

  var queue = [

    function NATIVE_MODE(done) {
      if(window.expectedBehavior) {
        done();
        return;
      }

      console.log('\ntest native');

      ifr = IFrame('[EXPECTED]'+name);

      // render tags inline
      mode = 'native';

      pauseMonitor = PauseMonitor(done);

      ifr.contentWindow.renderTag = function(i) {
        renderTag(tags[i]);
      };

      for(i = 0; tag = tags[i]; i++) {

        ifr.doc._write('<div class=tag id='+tag.id+'>');

        // render inline
        ifr.doc._write('<script class="test_helper">renderTag('+i+')</script>');
        ifr.doc._write('</div>');
      }

      pauseMonitor.checkDone();
    },

    function intermission(done) {
      console.log('\nintermission');

      if(GENERATE_EXPECTED) {
        var testBehavior = nativeBehavior['test '+name] = {};

        // spit out native
        for(i = 0; tag = tags[i]; i++) {
          testBehavior[tag.id] = {
            calls: tag.nativeCtx.calls
          };
        }
      }
      done();
    },

    function WRITER_MODE(done) {

      console.log('\ntest writer');

      ifr = IFrame('[ACTUAL]'+name);

      ifr.doc.write = function() {
        ok(false, ifr.doc.currentTag.id + ' - document.write outside: ' + [].slice.call(arguments).join(''));
      };

      for(i = 0; tag = tags[i]; i++) {
        ifr.doc._write('<div class=tag id='+tag.id+'></div>');
      }

      // render at the bottom of the page.

      mode = 'writer';

      pauseMonitor = PauseMonitor(done);

      var shuffledTags = random.shuffle(tags);

      ifr.contentWindow.renderTag = function(i) {
        ctx = shuffledTags[i].ctx;
        ctx.doc.currentTag = tag;
        ctx.render();
      };

      for(var i = 0; i < shuffledTags.length; i++) {
        (function(tag, i) {
          var ctx = Context[mode](tag, ifr.doc);
          pauseMonitor.add(ctx);
          tag.ctx = ctx;
          ctx.writer = postscribe(ctx.div, '<script class="test_helper">renderTag('+i+')</script>', {
            name: tag.id,
            beforeWrite: function(str) {
              return str;//.replace(/\.js/g, '.js?'+Math.random());
            },
            afterWrite: function(str) {
              ctx.written += str;
              ctx.compareInnerHtml(str);
            },
            error: function(e) {
              throw e;
            }
          });
        }(shuffledTags[i], i));
      }

      pauseMonitor.checkDone();
    },

    function finishedTest(done) {
      start();
      console.log('test finished '+name);
      done();
    }
  ];

  var next = function() {
    var fn = queue.shift();
    if(fn) {
      fn(next);
    }
  };

  next();
};


// innerHTML is sync under FF3.6. document.write is not.
// We only care about this for testing. On a live site htmlWrite
// behaves correctly because it's using innerHTML and not document.write
var supports = {
  docwriteSync: !($.browser.mozilla && $.browser.version.indexOf('1.9.') === 0)
};

var nativeTimeout;
var testWrite = function(name) {
  var fns = [].slice.call(arguments, 1);

  var Tag = function(render) {
    return {
      render: render
    };
  };

  var tags = [];

  for(var i = 0, fn; fn = fns[i]; i++) {
    tags.push(Tag(fn));
  }

  // TEST OPTIONS
  var options = testOptions;

  test(name+(window.JSON ? JSON.stringify(options):''), function() {
    execute(name, tags, options);

    if(GENERATE_EXPECTED && window.JSON && JSON.stringify) {
      clearTimeout(nativeTimeout);
      nativeTimeout = setTimeout(function() {
        console.log('Native behavior:');
        console.log(JSON.stringify(nativeBehavior));
      }, 2000);
    }

  });
};

//htmlParser.supports.tagSoup = false;

var setOptions = function(options) {
  options.useExpected = true;
  if(!supports.docwriteSync && !options.useExpected) {
    options.useInnerHtml = true;
  }
  if(options.useInnerHtml) {
    options.async = false;
    options.bufferPartialTags = true;
  }
  testOptions = options;
};


document.write([
  '<script type="text/vbscript">',
  'supportsVbscript = true',
  //'document.write("before<script>window.supportsVbscript = true<\\/script>|after")',
  '</script>'
].join('\n'));
