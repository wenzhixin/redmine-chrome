function initLocale(callback) {
    $.getScript('locale/' + settings('language') + '.js', function() {
        $('[i18n-values]').each(function() {
            $(this).text(locale[$(this).attr('i18n-values')]);
        });
        callback();
    });
}