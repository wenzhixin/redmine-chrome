/**
 * @author zhixin wen <wenzhixin2010@gmail.com>
 */

(function ($) {

    $(function () {
        ZeroClipboard.config({swfPath: $('[data-swf-path]').data('swf-path')});

        $('pre').each(function () {
            if (!$(this).find('code').length) {
                var code = $(this).html();
                $(this).html('');
                $('<code></code>').html(code).appendTo($(this));
            }
        }).append('<div class="plugin-zclip" title="Click to copy me.">Copy</div>');

        $('.plugin-zclip').each(function () {
            var $this = $(this),
                client = new ZeroClipboard($this[0]);

            client.on( "ready", function() {
                client.on('copy', function () {
                    ZeroClipboard.clearData();
                    var $code = $this.parent().find('code').clone();
                    $code.find('.line-numbers').remove();
                    ZeroClipboard.setData('text/plain', $code.text());
                    $this.text('Copied!');
                });
            });
        });
    });
})(jQuery.noConflict());
