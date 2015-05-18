/**
 * @author zhixin wen <wenzhixin2010@gmail.com>
 */

var settings = function (key, value) {
    var defaults = {
        language: 'en-US',
        urls: [],
        keys: [],
        roles: ['assigned_to_id'],
        status: [1, 2, 7, 4], // [1, 2, 7, 4, 3, 6, 16, 5]
        number: 25,
        interval: 5,
        notify: true,
        'new': false,
        data: {},
        unread: 0,
        url_index: 0,
        role_index: 0,
        order: 'default' // default, updated_on, priority.id, created_on
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
            util.setLocale($('html'));
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

    getPriorityLabel: function (priority) {
        return priority.toLowerCase();
    },

    copyText: function (text) {
        var $copyFrom = $('<textarea></textarea>');
        $('body').append($copyFrom);
        $copyFrom.val(text).select();
        document.execCommand('copy');
        $copyFrom.remove();
    },

    convertTextile: function (text) {
        var $copyFrom = $('<textarea></textarea>');
        $('body').append($copyFrom);
        $copyFrom.val(text);
        text = textile.convert($copyFrom.val());
        $copyFrom.remove();
        return text;
    },

    getValueByString: function (o, s) {
        s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
        s = s.replace(/^\./, '');           // strip a leading dot
        var a = s.split('.');
        while (a.length) {
            var n = a.shift();
            if (n in o) {
                o = o[n];
            } else {
                return '';
            }
        }
        return o;
    },

    getUrl: function (base, url) {
        if (url && url.slice(0, 1) === '/') {
            var a = document.createElement('a');
            a.href = base;
            return a.protocol + '//' + a.host + url;
        }
        return url;
    },

    sortIssues: function (issues, unreadList) {
        var order = settings('order'),
            sorter = function (a, b) {
                var aa = util.getValueByString(a, order),
                    bb = util.getValueByString(b, order);

                if (aa < bb) {
                    return 1;
                }
                if (aa > bb) {
                    return -1;
                }
                return 0;
            };

        if (order === 'default') {
            var issues1 = [],
                issues2 = [];

            $.each(issues, function (i, issue) {
                if ($.inArray(util.getIuid(issue), unreadList) !== -1) {
                    issues1.push(issue);
                } else {
                    issues2.push(issue);
                }
            });
            order = 'priority.id';
            issues2 = issues2.sort(sorter);
            return issues1.concat(issues2);
        }

        return issues.sort(sorter);
    }
};