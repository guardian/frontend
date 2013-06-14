define(["Config", "Common"], function (Config, Common) {

    var nodeList
      , delay = (function () { // http://stackoverflow.com/questions/1909441/jquery-keyup-delay
         var timer = 0;
         return function(callback, ms){
            clearTimeout (timer);
            timer = setTimeout(callback, ms);
            };
         })()
      , keyHandler = function () {
            nodeList.keyup(function (e) {
                var that = this;
                Common.mediator.emitEvent('ui:autocomplete:keydown', [this.value]);
                if (this.value.length <= 2) {
                    return false;
                }
                delay(function () {
                    Common.mediator.emitEvent('modules:oncomplete', [that]);
                }, 700)
            })
          }
       , populate = function (tag, element) {
                element.val(tag).change();
                Common.mediator.emitEvent('ui:networkfronttool:tagid:selected', [{}, element]);
          }
       , valid = function(element, tagData) {
                $(element).removeClass('invalid');
                if (tagData && tagData.webTitle) {
                    // firing change event explicitly, not fire when calling val (needed for knockout to register model
                    // change)
                    $(element).siblings('[name=tag-title]').val(tagData.webTitle).change();
                }
          }
       , invalid = function(element) {
            $(element).addClass('invalid');
       }
       , init = function(opts) {

            var opts = opts || {};
            nodeList = opts.nodeList || null;

            keyHandler();

            nodeList.change(function () {
                Common.mediator.emitEvent('modules:tagentry:onchange', [this.value]);
            })

            Common.mediator.addListener('modules:autocomplete:selected', populate);
            Common.mediator.addListener('modules:tagvalidation:success', valid)
            Common.mediator.addListener('modules:tagvalidation:failure', invalid)
         };

      return {
        populate: populate,
        keyHandler: keyHandler,
        init: init
      }

});
