/**
 * @author zhixin wen <wenzhixin2010@gmail.com>
 * @date 2012-08-28
 */

var settings = function (key, value) {
    var defaults = {
        language: 'en-US',
        urls: [],
        roles: ['assigned_to_id'],
        status: [1, 2, 7, 4], // [1, 2, 7, 4, 3, 6, 16, 5]
        number: 25,
        interval: 5,
        notify: true,
        'new': false,
        data: {},
        unread: 0,
        url_index: 0,
        role_index: 0
    };

    if (typeof value === 'undefined') {
        return typeof store.get(key) !== 'undefined' ? store.get(key) : defaults[key];
    }

    store.set(key, value);
    return this;
};

var util = {
    sprintf: function (str) {
        var args = arguments,
            flag = true,
            i = 1;

        str = str.replace(/%s/g, function () {
            var arg = args[i++];

            if (typeof arg === 'undefined') {
                flag = false;
                return '';
            }
            return arg;
        });
        if (flag) {
            return str;
        }
        return '';
    },

    initLocale: function (callback) {
        $.getScript('locale/' + settings('language') + '.js', function() {
            util.setLocale($('body'));
            callback();
        });
    },

    setLocale: function ($el) {
        $el.find('[i18n-properties]').each(function () {
            var properties = $(this).attr('i18n-properties').split(':');
            if (properties.length === 2) {
                $(this).attr(properties[0], locale[properties[1]]);
            }
        });
        $el.find('[i18n-values]').each(function () {
            $(this).text(locale[$(this).attr('i18n-values')]);
        });
    },

    filterIssues: function (keys, issues, data) {
        return issues.filter(function (issue) {
            for (var k in data) {
                if ($.inArray(k, keys) === -1) continue;
                for (var i = 0; i < data[k].issues.length; i++) {
                    if (data[k].issues[i].id === issue.id) {
                        return false;
                    }
                }
            }
            return true;
        });
    },

    getIuid: function (issue) {
        return issue.id + new Date(issue.updated_on).getTime();
    },

    getContentUrl: function (value, attachments) {
        for (var i = 0; i < attachments.length; i++) {
            var attachment = attachments[i];
            if (value == attachment.filename) {
                return attachment.content_url;
            }
        }
        return null;
    },

    getPriorityLabel: function (priority) {
        return {
            Low: 'info',
            Normal: 'warning',
            High: 'default',
            Urgent: 'primary',
            Immediate: 'danger'
        }[priority];
    },

    copyText: function (text) {
        var $copyFrom = $('<textarea></textarea>');
        $('body').append($copyFrom);
        $copyFrom.val(text).select();
        document.execCommand('copy');
        $copyFrom.remove();
    }
};