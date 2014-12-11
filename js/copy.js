$(function () {
    ZeroClipboard.config({swfPath: $('[data-swf-path]').data('swf-path')});

    $('pre').append('<div class="plugin-zclip" data-clipboard-text="Copy Me!" title="Click to copy me.">Copy</div>');
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
