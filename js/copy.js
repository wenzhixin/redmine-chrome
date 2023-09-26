/**
 * @author zhixin wen <wenzhixin2010@gmail.com>
 */

($ => {
  $(() => {
    ZeroClipboard.config({
      swfPath: $('[data-swf-path]').data('swf-path')
    })

    $('pre').each((i, el) => {
      if (!$(el).find('code').length) {
        const code = $(el).html()

        $(el).html('')
        $('<code></code>').html(code).appendTo($(el))
      }
    }).append('<div class="plugin-zclip" title="Click to copy me.">Copy</div>')

    $('.plugin-zclip').each((i, el) => {
      const $this = $(el)
      const client = new ZeroClipboard($this[0])

      client.on('ready', () => {
        client.on('copy', () => {
          ZeroClipboard.clearData()
          const $code = $this.parent().find('code').clone()

          $code.find('.line-numbers').remove()
          ZeroClipboard.setData('text/plain', $code.text())
          $this.text('Copied!')
        })
      })
    })
  })
})(jQuery.noConflict())
