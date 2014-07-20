/**
 * @author zhixin wen <wenzhixin2010@gmail.com>
 * @date 2012-08-28
 */

var settings = function (key, value) {
    var defaults = {
        urls: [],
        roles: ['assigned_to_id'],
        status: [1, 2, 7, 4, 3, 6, 16, 5],
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

	dateFormatter: function (date) {
		var y = date.getFullYear();
		var m = date.getMonth() + 1;
		var d = date.getDate();
		var h = date.getHours();
		var mm = date.getMinutes();
		var s = date.getSeconds();

		return [
            [y, m < 10 ? ('0' + m) : m, d < 10 ? ('0' + d) : d].join('-'),
            [h < 10 ? ('0' + h) : h, mm < 10 ? ('0' + mm) : mm, s < 10 ? ('0' + s) : s].join(':')
        ].join(' ');
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
	}
};