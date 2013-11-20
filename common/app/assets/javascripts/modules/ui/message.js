define([
    "$",
    "utils/storage",
    "bean",
    "modules/userPrefs"
], function (
    $,
    storage,
    bean,
    userPrefs
) {

    function Message(id) {
            
        var self = this;

        this.prefs = 'message.' + id;
        this.header = $('#header');
        this.container = $('.site-message');
        
        bean.on(document, 'click', '.js-site-message-close', function(e) {
            self.acknowledge();
        });
    }

    Message.prototype.show = function(message) {
        $('.site-message__message').html(message);
        this.header.addClass('js-site-message');
        this.container.removeClass('u-h');
    };
    
    Message.prototype.hasSeen = function() {
        return !!userPrefs.get(this.prefs);
    };

    Message.prototype.seen = function() {
        userPrefs.set(this.prefs, true);
    };
    
    Message.prototype.acknowledge = function() {
        this.seen();
        this.hide();
    };
   
    Message.prototype.hide = function() {
        this.header.removeClass('js-site-message');
        this.container.addClass('u-h');
    };
    
    return Message;
});
