function initLocale(callback) {
    $.getScript('locale/' + settings('language') + '.js', function() {
        util.setLocale($('body'));
        callback();
    });
}