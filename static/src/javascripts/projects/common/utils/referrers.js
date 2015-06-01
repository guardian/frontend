define(function () {
    return {
        isFacebook: function () {
            return /\.facebook\.com/.test(document.referrer);
        }
    };
});
