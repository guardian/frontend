define([
    "$",
    "bean",
    "utils/storage",
    "modules/userPrefs"
], function (
    $,
    bean,
    storage,
    userPrefs
) {

    var Message = function(id) {
            
        var self = this;
        this.prefs = 'message.' + id;

        bean.on(document, 'click', '.js-site-message-close', function(e) {
            self.acknowledge();
        });
    };

    Message.prototype.show = function(message) {
        $('.js-site-message-copy').html(message);
        $('#header').addClass('js-site-message');
        $('.site-message').removeClass('u-h');
    };
    
    Message.prototype.hide = function() {
        $('#header').removeClass('js-site-message');
        $('.site-message').addClass('u-h');
    };
    
    Message.prototype.hasSeen = function() {
        return !!userPrefs.get(this.prefs);
    };

    Message.prototype.remember = function() {
        userPrefs.set(this.prefs, true);
    };
    
    Message.prototype.acknowledge = function() {
        this.remember();
        this.hide();
    };
    
    return Message;
});
