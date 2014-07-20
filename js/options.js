/**
 * @author zhixin wen <wenzhixin2010@gmail.com>
 */

$(function() {

    // urls
    var itemTpl = $('#itemTpl').html(),
        urlsHtml = [],
        filtersHtml = [],
        $urls = $('#urls'),
        updateUrls = function () {
            var urls = [];
            $urls.find('input').each(function() {
                urls.push($(this).val());
            });
            settings('urls', urls);
        };

    $.each(settings('urls'), function (i, url) {
        urlsHtml.push(util.sprintf(itemTpl, url));
    });
    $urls.html(urlsHtml.join(''));
    $('#addUrl').click(function () {
        $urls.append(util.sprintf(itemTpl, ''));
    });
    $(document).on('click', '.remove-url', function () {
        $(this).parents('.input-group').remove();
        updateUrls();
    });
    $(document).on('keyup', '#urls input', updateUrls);

    // roles, status
    $.each(['roles', 'status'], function (i, name) {
        var $name = $('#' + name).multipleSelect({
            selectAll: false,
            countSelected: false,
            onClick: function() {
                settings(name, $name.multipleSelect('getSelects'));
            }
        }).multipleSelect('setSelects', settings(name));
    });

    // number, interval
    $.each(['number', 'interval'], function (i, name) {
        var $name = $('#' + name).multipleSelect({
            single: true,
            onClick: function() {
                settings(name, $name.multipleSelect('getSelects')[0]);
            }
        }).multipleSelect('setSelects', [settings(name)]);
    });

    $('#notify').prop('checked', settings('notify')).click(function () {
        settings('notify', $(this).prop('checked'));
    })
});