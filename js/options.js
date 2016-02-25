/**
 * @author zhixin wen <wenzhixin2010@gmail.com>
 */

$(function () {

    var $language = $('#language'),
        $save = $('#save'),
        $urls = $('#urls'),
        $advance = $('#advance'),
        $addUrl = $('#addUrl'),
        $roles = $('#roles'),
        $status = $('#status'),
        $number = $('#number'),
        $interval = $('#interval'),
        $notify = $('#notify'),
        $notifyStatus = $('#notify_status');

    function init() {
        $('[data-toggle="tooltip"]').tooltip({
            placement: 'bottom'
        });

        // language
        $language.change(function () {
            settings('language', $(this).val());
            location.reload(true);
        }).val(settings('language'));

        $save.click(save);

        // urls
        var itemTpl = $('#itemTpl').html(),
            urlsHtml = [];

        $.each(settings('urls'), function (i, url) {
            urlsHtml.push(util.sprintf(itemTpl, url, settings('keys')[i] || ''));
        });
        $urls.html(urlsHtml.join(''));
        $addUrl.click(function () {
            $urls.append(util.sprintf(itemTpl, '', ''));
        });
        $(document).on('click', '.remove-url', function () {
            $(this).parents('.input-inline').remove();
        });

        if (settings('urls').length) {
            $advance.show();
        } else {
            $addUrl.trigger('click');
            $urls.find('input[name="url"]').focus().keyup(function () {
                if ($.trim($(this).val())) {
                    $advance.show();
                } else {
                    $advance.hide();
                }
            });
        }

        // roles, status, notify_status
        $.each(['roles', 'status', 'notify_status'], function (i, name) {
            $('#' + name).multipleSelect({
                width: '100%',
                selectAll: false,
                countSelected: false
            }).multipleSelect('setSelects', settings(name));
        });

        // number, interval
        $.each(['number', 'interval'], function (i, name) {
            var $name = $('#' + name).multipleSelect({
                width: '100%',
                single: true,
                name: name
            }).multipleSelect('setSelects', [settings(name)]);
        });

        $notify.prop('checked', settings('notify'));
        // notify_status
        var updateNotifyStatus = function (checked) {
            $notifyStatus.multipleSelect(checked ? 'enable' : 'disable');
        };
        $notify.click(function () {
            updateNotifyStatus($notify.prop('checked'));
        });
        updateNotifyStatus(settings('notify'));
    }

    function save() {
        var urls = [],
            keys = [];

        $urls.find('input[name="url"]').each(function () {
            var url = $.trim($(this).val());
            if (url) {
                urls.push(url.replace(/\/$/, ''));
            }
        });
        $urls.find('input[name="key"]').each(function () {
            keys.push($.trim($(this).val()));
        });
        settings('urls', urls);
        settings('keys', keys);
        settings('roles', $roles.multipleSelect('getSelects'));
        settings('status', $status.multipleSelect('getSelects').map(function (i) {return +i;}));
        settings('number', +($number.multipleSelect('getSelects')[0]));
        settings('interval', +($interval.multipleSelect('getSelects')[0]));
        settings('notify', $notify.prop('checked'));
        settings('notify_status', $notifyStatus.multipleSelect('getSelects').map(function (i) {return +i;}));

        alert(locale.save_successful);
        chrome.extension.getBackgroundPage().background.reset();
    }

    util.initLocale(init);
});