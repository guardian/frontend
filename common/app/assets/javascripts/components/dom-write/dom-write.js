
var catchError = function(func,description){
    description = description || 'error.catchError';
    var safefunc = function(){
      try {
              return func.apply(this,arguments);
                } catch(e) {
                        if (window.onerror){
                                  window.onerror(description+': '+e.message+' in '+func,
                                                               e.fileName, e.lineNumber,true);
                                      }
                          }
      };
    return safefunc;
};

/*
 * bezen.domwrite.js - Simulated document.write and writeln for the safe
 *                     loading of external scripts after page load
 *
 * author:    Eric Bréchemier <bezen@eric.brechemier.name>
 * license:   Creative Commons Attribution 3.0 Unported
 *            http://creativecommons.org/licenses/by/3.0/
 * version:   2012-08-15
 *
 * To Cecile, with Love,
 * you were the first to wait for the conception of this library
 *
 * I developed this library to allow a deferred loading for third party
 * scripts making use of document.write().
 *
 * The problem:
 *   - external scripts typically inserted for advertisements and analytics
 *     are not necessary to the initial loading of the page
 *   - however, when they call document.write() after window.onload fired,
 *     the page is reset to blank, which prevents lazy loading
 *
 * The solution:
 *   - replace document.write to prevent the page reset, collect the markup
 *     and insert it in the DOM dynamically.
 *
 *   In all examples below, $ is an alias to document.getElementById:
 *   var $ = function(id){ return document.getElementById(id) };
 *
 *   // First example: load with bezen.load.js
 *   window.onload = function() {
 *     // capture document.write and document.writeln
 *     bezen.domwrite.capture();
 *
 *     // by default, loading and rendering are done at end of document.body
 *     bezen.load.script("http://example.com/js/analytics", function(){
 *       // render the captured markup to document.body
 *       bezen.domwrite.render(function(){
 *         // optionally, change the parent for the second script
 *         var parent = $('ads');
 *         bezen.load.script(parent, "http://example.com/js/ads", function(){
 *           // render (newly) captured markup to selected parent
 *           bezen.domwrite.render(parent);
 *         });
 *       });
 *     });
 *   };
 *
 *   The same example can be rewritten to make use of LABjs (http://labjs.com)
 *   instead of bezen.load.js:
 *
 *   // Second example: load with LAB.js
 *   window.onload = function() {
 *     // capture document.write and document.writeln
 *     bezen.domwrite.capture();
 *
 *     $LAB
 *     .setOptions({AppendTo: "body"}) // create scripts in document.body
 *     .script("http://example.com/js/analytics")
 *     .wait(function(){
 *       // render the captured markup to document.body
 *       bezen.domwrite.render(document.body, function() {
 *         // optionally, change the parent for the second script
 *         var parent = $('ads');
 *         $LAB
 *         // LABjs provides no way to select a parent other than head/body;
 *         // defaults to .setOptions({AppendTo: "head"})
 *         .script("http://example.com/js/ads")
 *         .wait(function(){
 *           // render (newly) captured markup to selected parent
 *           bezen.domwrite.render(parent);
 *         });
 *       });
 *     });
 *   }
 *
 * Limitations:
 *   I identified four differences between this simulation of document.write
 *   and the browser's implementation of document.write:
 *
 *   1°) The browser inserts markup immediately. No insertion is done in this
 *   simulation until the next call to bezen.domwrite.render. The capture
 *   just stores the markup until render() inserts it in selected parent
 *   and runs any included script.
 *
 *   PROS: the overall result at the end of the processing is the most
 *   accurate with this late rendering: since document.write allows to write
 *   opening and closing tags in separate calls, inserting markup after each
 *   call leads to unexpected results due to an automatic repair done by the
 *   browser for unclosed elements.
 *
 *   CONS: in incriminated scripts, written nodes will not appear in the DOM
 *   immediately after a call to document.write(), and trying to retrieve
 *   such an element with getElementById or getElementsByTagName will lead to
 *   a null result.
 *
 *   2°) During normal document construction, any script element inserted with
 *   document.write is always last in the document, and can be retrieved at
 *   last position in document.getElementsByTagName("script"). In this
 *   implementation, after rendering, the same script would be found last
 *   in selected parent element, and would not necessarily be last in the
 *   document. A turnaround is to use document.body as parent for rendering.
 *
 *   3°) This implementation yields during rendering after inserting a script
 *   element to wait for its execution, and also after inserting one or
 *   several nodes without script to let the browser process user events.
 *   During the yield, some contents may be inserted in the document, by
 *   separate scripts or by the processing of following markup during document
 *   loading. I encountered the latter case during unit testing: all tests
 *   where triggered by an internal script at the end of the body, but followed
 *   by some whitespace ("\n  ") due to code indentation. While running a test
 *   of render() with document.body as parent, this whitespace got inserted
 *   during the first yield of the script, which is after the first dynamic
 *   node and before the followings.
 *
 *   In the browser's implementation of document.write, no yielding occurs
 *   during rendering (which is part of document.write). A turnaround is to
 *   start the dynamic loading in window.onload to ensure that all the markup
 *   in the source document has been processed, and to build a safe sequence
 *   of execution for scripts based on known dependencies, waiting for the
 *   callback of bezen.domwrite.render() before loading the following script.
 *
 *   4°) in case of errors while loading, parsing or running scripts inserted
 *   with document.write, the insertion and interpretation of following markup
 *   will go on, in browser's implementation. In this implementation, any such
 *   error will stop the rendering of captured markup.
 *
 * Direction for future developments:
 *   If these limitations happen to have a significant impact on existing
 *   libraries in the wild, I may rework the underlying algorithm, by using
 *   a custom HTML parser to insert nodes immediately while keeping track
 *   of unclosed tags.
 *
 *   Under these circumstances, with a partial rendering done at the end of
 *   each call to document.write, a new, more complex callback mechanism would
 *   be needed to get a hint of the complete loading of a script and its
 *   dependencies.
 *
 * Credits:
 *   I'm just standing on the shoulders of giants, who shared their knowledge
 *   on blogs, web sites, books and in their Javascript libraries:
 *
 *   John Resig
 *     XHTML, document.write, and Adsense
 *     http://ejohn.org/blog/xhtml-documentwrite-and-adsense/
 *
 *   Steve Souders
 *     "Delayed Script Execution" in Opera
 *     http://stevesouders.com/tests/delayed-script-execution.php
 *
 *   Nicholas C. Zakas
 *     The best way to load external JavaScript
 *     http://www.nczonline.net/blog
 *           /2009/07/28/the-best-way-to-load-external-javascript/
 *
 *   Frank Thuerigen
 *     solution: lazy loading JS ad code containing document.write()
 *     http://www.webdeveloper.com/forum/showthread.php?t=195112
 *
 *   Kyle Simpson, whith whom I discussed this library and its use with LABjs
 *     LABjs (Loading And Blocking JavaScript)
 *     http://labjs.com/
 */
/*requires bezen.js */
/*requires bezen.string.js */
/*requires bezen.array.js */
/*requires bezen.dom.js */
/*jslint evil:true, nomen:false, white:false, onevar:false, plusplus:false */
/*global bezen, document, setTimeout */


define(function() { 

    var bezen = {
        nix: function(){},
        string: {
            trim: function(string) {
                string = string.replace(/^\s\s*/, '');
                return string.replace(/\s\s*$/, '');
            }
        },
        array: {
            empty: function(a) {
                a.length = 0;
            }
        },
        dom: {
            hasAttribute: function(node, attributeName) {
                if (node.hasAttribute) {
                    return node.hasAttribute(attributeName);
                }

                var attributeNode = node.getAttributeNode(attributeName);
                if (attributeNode === null) {
                    return false;
                }
                return attributeNode.specified;
            },
            appendScript: function(parent, scriptElt, listener) {
                var safelistener = catchError(listener,'script.onload');
                    // Opera has readyState too, but does not behave in a consistent way
                    if (scriptElt.readyState && scriptElt.onload!==null) {
                    // IE only (onload===undefined) not Opera (onload===null)
                    scriptElt.onreadystatechange = function() {
                    if ( scriptElt.readyState === "loaded" ||
                    scriptElt.readyState === "complete" ) {
                    // Avoid memory leaks (and duplicate call to callback) in IE
                    scriptElt.onreadystatechange = null;
                    scriptElt.onerror = null;
                    safelistener();
                    }
                    };
                    } else {
                    // other browsers (DOM Level 0)
                    scriptElt.onload = safelistener;
                } 
                parent.appendChild( scriptElt ); 
            }
        }
    } 
 
bezen.domwrite = (function() {

  // Builder of
  // Closure for Simulated document.write and document.writeln

  // Define aliases
  var nix = bezen.nix,
      trim = bezen.string.trim,
      empty = bezen.array.empty,
      hasAttribute = bezen.dom.hasAttribute,
      appendScript = bezen.dom.appendScript,
  // Original browser functions
      originalDocumentWrite = document.write,
      originalDocumentWriteln = document.writeln;

  // array of HTML markup written in subsequent calls to domWrite function.
  // The collectMarkup function collects the markup and empties the array.
  var markupArray = [];

  var domWrite = function(markup) {
    // simulated document.write function.
    // It is intended to enable, after window onload, the dynamic loading
    // of external scripts that call the document.write function.
    //
    // Note: unlike native document.write, domWrite does not call
    //       document.open() after window onload, thus preventing
    //       the document reset which happens in this case.
    //
    // params:
    //   markup - (string) HTML markup
    
      markupArray.push( markup );
  };

  var domWriteln = function(markup) {
    // simulated document.writeln function
    //
    // params:
    //   markup - (string) HTML markup
    
    domWrite( markup+'\n' );
  };

  var collectMarkup = function() {
    // retrieve the markup collected by domWrite
    // or null if no markup was collected
    //
    // return: (string)
    //   null if domWrite has not called since last call to collectMarkup,
    //   otherwise the concatenated markup collected by domWrite (ordered)
    //
    if (markupArray.length === 0) {
      return null;
    }
    
    var markup = markupArray.join('');
    empty(markupArray);
    return markup;
  };

  var parseMarkup = function(markup) {
    // parse HTML by inserting markup in a new div outside the DOM
    //
    // This is the method used in this module to parse the markup written
    // to document.write and document.writeln, in a call to render().
    //
    // Note: The <br> hack is required for proper parsing of script
    //       elements in IE. It consists in inserting a <br> element
    //       at start of markup (then removed before returning result).
    //
    // param:
    //   markup - (string) (!nil) HTML markup to parse
    //
    // return: (DOM node)
    //   the first child node (might be null), within its parent parser div

    var divParser = document.createElement("div");
    divParser.innerHTML = '<br/>'+markup;
    divParser.removeChild( divParser.firstChild );
    return divParser.firstChild;
  };

  var isJavascriptScript = function(node) {
    // check whether this node is a script element identified as javascript
    //
    // params:
    //   node - (DOM node) (!nil) the node to check
    //
    // return: (boolean)
    //   false if node.nodeName !== "SCRIPT"
    //         or (node.language
    //             && node.language.toLowerCase() !== "javascript")
    //         or (node.type
    //             && node.type.replace(
    //                  /^\s+|\s+$/g,""
    //                ).toLowerCase() !== "text/javascript"
    //   true otherwise
    //
    // Note: this method does not take into account the overload of default
    //       script type using HTTP or meta parameter.
    //       For cross-browser compatibility, it also ignores alternate MIME
    //       types for javascript:
    //       - "application/javascript" (the new standard)
    //       - "application/x-javascript" (private extension)
    //       Only the deprecated "text/javascript" is supported here.
    //

    if ( node.nodeName !== "SCRIPT" ) {
      return false;
    }

    if ( node.language &&
         node.language.toLowerCase() !== "javascript" ) {
      return false;
    }

    if ( node.type &&
         trim(node.type).toLowerCase() !== "text/javascript" ) {
      return false;
    }

    return true;
  };

  var appendScriptClone = function(parent, scriptElt, listener) {
    // clone a script element with custom code to ensure
    // that it runs and that provided callback is triggered
    // then append it to parent.
    //
    // Note: to design this method, I performed extensive tests of dynamic
    //       loading in these browsers:
    //         - IE6, IE7, IE8,
    //         - FF2, FF3, FF3.5,
    //         - Safari 3.1, Safari 4.0,
    //         - Chrome 2,
    //         - Opera 9.6 and Opera 10
    //
    // The steps to clone external scripts are:
    //   - create a new script node
    //   - copy all (non-default) attributes
    //   - copy the script text
    //
    // The steps are different for internal scripts:
    //   - clone it in a shallow way with cloneNode(false)
    //   - copy the script text
    //   - set the "type" attribute to "any" before appending to the DOM
    //   - restore the original type attribute afterwards
    // These steps ensure that the internal script is cloned but does not run,
    // which allows to trigger the callback in a reliable way:
    //   - evaluate the script text using a new Function()
    //   - trigger the callback (after yield) with setTimeout
    //
    // params:
    //   parent - (DOM element) (!nil) parent element to append the script to
    //   scriptElt - (DOM element) (!nil) the script element to copy
    //               It must be a Javascript script.
    //   listener - (function) (!nil) the listener function to be triggered
    //              when the script has been loaded and run
    //
    // Known Limitations:
    //   - in case of error in an external or internal script cloned with this
    //     method, the listener is never triggered. I thought about using the
    //     script.onerror handler to detect errors and go on, but this handler
    //     is only triggered for external scripts, for unusual errors such as
    //     interruption of the download or missing local file, and cannot be
    //     relied on cross-browser. In addition, parsing errors or other
    //     Javascript errors do not trigger the script.onerror handler, only,
    //     in some browsers, the global window.onerror handler.
    //
    //   - for consistency between internal and external scripts, I refrained
    //     from adding a try/catch mechanism around the evaluation of the
    //     internal script code. As a consequence, any error thrown during the
    //     evaluation will break the chain of loading in the same manner.
    //
    // References:
    //   How to trigger script.onerror in Internet Explorer? - StackOverflow
    //   http://stackoverflow.com/questions/2027849
    //         /how-to-trigger-script-onerror-in-internet-explorer
    //
    //   onerror Event - MSDN
    //   http://msdn.microsoft.com/en-us/library/cc197053%28VS.85%29.aspx

    if ( hasAttribute(scriptElt,"src") ) {
      var externalScript = document.createElement("script");
      for (var i=0; i<scriptElt.attributes.length; i++) {
        var attribute = scriptElt.attributes[i];
        if (  hasAttribute( scriptElt, attribute.name )  ) {
          externalScript.setAttribute(attribute.name, attribute.value);
        }
      }
      externalScript.text = scriptElt.text;
      appendScript(parent, externalScript, listener);
    } else {
      var internalScript = scriptElt.cloneNode(false);
      internalScript.text = scriptElt.text;
      internalScript.type = "any";
      parent.appendChild( internalScript );
      // revert "type" attribute to its original state
      if ( hasAttribute(scriptElt, "type") ) {
        // restore original value
        internalScript.setAttribute("type", scriptElt.type);
      } else {
        // remove newly created type attribute
        internalScript.removeAttribute("type");
      }

      // global eval script text to run it now, just once
      (  new Function( internalScript.text )  )();

      // run the callback just after
      listener();
    }
  };

  // Note: the declaration of render before use by loadPiecemeal is required
  //       by JSLint - these two methods are mutually recursive
  var render;

  var loadPiecemeal = function(parent, input, callback) {
    // load input created by parseMarkup node by node, by:
    //   - inserting a clone of the input node in the document
    //   - loading scripts and loading in turn any markup collected
    //   - going on with the following node in the input, in "document order"
    //   - finally, firing the callback after reaching the end of the input
    //
    // Note: this method is intended for private use, in combination with
    //       domWrite and render to simulate document.write
    //
    // params:
    //   parent - (DOM element) (!nil) current parent to append cloned nodes to
    //   input - (DOM node) (null) current node in the input generated by
    //           the parser parseMarkup(). A null value means that the end of
    //           the input has been reached
    //   callback - (function) (!nil) the function to trigger after the end of
    //              successful loading.
    //              Warning: the callback function is mandatory here, as it
    //                       is required to report the end of the processing
    //

    if (input===null) {
      // end of the input
      callback();
      return;
    }

    var nextInput = null;
    var nextParent = parent;
    var nextStep = function() {
      loadPiecemeal(nextParent, nextInput, callback);
    };

    if ( isJavascriptScript(input) ) {
      setTimeout(function(){
        appendScriptClone(parent, input, function() {
          render(parent, nextStep);
        });
      },0);
      // keep nextInput null - skip first child for cross-browser consistency

    } else {
      // regular node
      var clone = input.cloneNode(false);
      parent.appendChild(clone);
      setTimeout(nextStep, 0);

      if (input.firstChild) {
        var scriptCount = input.getElementsByTagName('script').length;
        if ( scriptCount === 0 ) {
          // shortcut: if there is no script within
          //           copy all descendants at once as innerHTML
          clone.innerHTML = input.innerHTML;
        } else {
          // go the long way
          nextInput = input.firstChild;
          nextParent = clone;
        }
      }
    }

    // Note: I do not return in the above if/else, but plan the nextStep
    //       closure execution with listeners / setTimeout.
    //       I can then update safely the nextInput and nextParent
    //       referenced by the closure.
    // Important: this relies on the fact that setTimeout defers the execution
    //       of the next step after the end of the current thread of execution.
    //       It will work here only as long as a setTimeout *is* met on all
    //       paths (internal script / external script / regular node).
    //       It worked *most*of*the*time* by appending an external script to
    //       the DOM and setting the next step to the callback, except,
    //       sometimes, in Safari, where the script may run immediately,
    //       followed by the callback, without waiting for the end of the
    //       current method. I first fixed it by using setTimeout to append
    //       the external script. I then moved it to the upper lever, around
    //       appendScriptClone in loadPiecemeal.
    //       This behavior must be preserved across future refactorings.

    // if there is no first child (or if this is a script node)
    // move to the next sibling
    if (nextInput === null) {
      nextInput = input.nextSibling;
    }

    // if there is no next sibling
    // move to the first sibling found in an ancestor
    var inputAncestor = input.parentNode;
    while( nextInput === null && inputAncestor !== null) {
      nextInput = inputAncestor.nextSibling;
      nextParent = nextParent.parentNode;
      inputAncestor = inputAncestor.parentNode;
    }

    // return to yield
    return;
  };

  var capture = function() {
    // start capturing markup written to document.write and document.writeln,
    // by replacing the functions with methods domWrite and domWriteln from
    // this module
    //
    // In order to preserve any replacement function already set to write or
    // writeln, the capturing functions domWrite and domWriteln are only set
    // if the corresponding property is still equal to the original browser
    // function (saved as reference in a variable when this module loaded).
    //
    // For example, if document.write has already been replaced by a function
    // defined by bezen.ready to capture the script defer hack, while
    // document.writeln is still the original browser function, the former
    // will be preserved, and the latter set to the domWriteln function.

    var dom = document;
    if (dom.write===originalDocumentWrite){
      dom.write = domWrite;
    }
    if (dom.writeln===originalDocumentWriteln){
      dom.writeln = domWriteln;
    }
  };

  // Note: already declared before use by loadPiecemeal:
  // these two methods are mutually recursive
  render = function(parent, callback) {
    // load markup collected by domWrite in a progressive way,
    // to simulate document.write: after loading a script,
    // any markup collected is first loaded and appended at current location,
    // then the processing of remaining markup is resumed.
    //
    // params:
    //   parent - (DOM element) (optional) (default: document.body) the parent
    //            to append new markup to
    //   callback - (function) (optional) (default: bezen.nix) function to
    //              call after successful loading of the complete markup
    //
    // Note:
    //   In case no markup has been collected, the callback fires immediately.
    //
    
    if (parent instanceof Function) {
      // callback provided as first parameter, no parent provided
      callback = parent;
      parent = document.body;
    } else {
      parent = parent || document.body;
      callback = callback || nix;
    }

    var markup = collectMarkup();
    
    if (markup===null) {
      callback.call();
    } else {
      loadPiecemeal(parent, parseMarkup(markup), callback);
    }
  };

  var restore = function(){
    // restore the original browser functions (saved in variables during the
    // loading of this module) to document.write and document.writeln

    document.write = originalDocumentWrite;
    document.writeln = originalDocumentWriteln;
  };

  return { // public API
    capture: capture,
    parseMarkup: parseMarkup,
    render: render,
    restore: restore,

    _: { // private section, for unit tests
      markupArray: markupArray,
      domWrite: domWrite,
      domWriteln: domWriteln,
      collectMarkup: collectMarkup,
      isJavascriptScript: isJavascriptScript,
      appendScriptClone: appendScriptClone,
      loadPiecemeal: loadPiecemeal
    }
  };
}());

    return bezen.domwrite;

});

