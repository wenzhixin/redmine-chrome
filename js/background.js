/**
 * @author zhixin wen <wenzhixin2010@gmail.com>
 */

function Background() {
    this.timeoutId = 0;
    this.unreadCount = 0;
}

Background.prototype.init = function () {
    this.initOptions();
    this.initRequest();
};

Background.prototype.initOptions = function () {
    if (!settings('new')) {
        chrome.tabs.create({
            url : chrome.extension.getURL("options.html")
        });
        settings('new', true);
    }
};

Background.prototype.initRequest = function () {
    var that = this,
        addresses = [];

    this.error = false;
    this.data = settings('data');
    this.keys = [];
    $.each(settings('urls'), function (i, url) {
        addresses.push({
            url: url,
            key: settings('keys')[i] || ''
        });
    });
    async.eachSeries(addresses, function (address, callback) {
        async.eachSeries(settings('roles'), function (role, callback) {
            that.getList(address, role, callback);
        }, callback);
    }, function () {
        settings('data', that.data);
        settings('unread', that.unreadCount);
        console.log(that.error);
        chrome.browserAction.setBadgeText({
            text: that.error ? 'x' : (that.unreadCount > 0 ? that.unreadCount + '' : '')
        });
        that.unreadCount = 0;
        that.timeoutId = setTimeout($.proxy(that.initRequest, that), settings('interval') * 60 * 1000);
    });
};

Background.prototype.getList = function (address, role, callback) {
    var that = this,
        key = $.md5(address.url + role),
        data = {
            set_filter: 1,
            sort: 'updated_on:desc',
            status_id: settings('status').join('|'),
            limit: settings('number'),
            key: address.key
        };

    data[role] = 'me';
    $.ajax({
        url: address.url + '/issues.json',
        data: data,
        dataType: 'json',
        success: function (res) {
            var lastRead = new Date(0),
                lastNotified = new Date(0),
                unreadList = [],
                readList = [],
                issues = util.filterIssues(that.keys, res.issues, that.data);

            that.keys.push(key);

            if (!that.data.hasOwnProperty(key)) {
                that.data[key] = {};
            }

            that.data[key].issues = issues;
            that.data[key].error = false;

            if (that.data[key].lastRead) {
                lastRead.setTime(that.data[key].lastRead);
            }

            if (that.data[key].lastNotified) {
                lastNotified.setTime(that.data[key].lastNotified);
            }

            if (that.data[key].readList) {
                readList = that.data[key].readList;
            } else {
                that.data[key].readList = [];
            }

            var count = 0;
            for (var i = that.data[key].issues.length - 1; i >= 0; i--) {
                var issue = that.data[key].issues[i],
                    updatedOn = new Date(issue.updated_on);

                if (lastRead < updatedOn) {
                    if ($.inArray(util.getIuid(issue), readList) === -1) {
                        count++;
                        unreadList.push(util.getIuid(issue));
                    }
                }
                if (lastNotified < updatedOn) {
                    lastNotified.setTime(updatedOn.getTime());
                    if (count < 4) {
                        that.showNotification(issue);
                    }
                }
            }

            that.data[key].lastNotified = lastNotified.getTime();
            that.data[key].unreadList = unreadList;
            that.unreadCount += count;
            callback();
        },
        error: function () {
            if (!that.data.hasOwnProperty(key)) {
                that.data[key] = {};
            }
            that.data[key].error = true;
            that.error = true;
            callback();
        }
    });
};

Background.prototype.showNotification = function (issue) {
    if (!settings('notify')) return;

    chrome.notifications.create(new Date().getTime() + '', {
        type: 'basic',
        title: issue.subject,
        message: issue.description,
        iconUrl: chrome.runtime.getURL("/icon128.png")
    }, function(id) {
        setTimeout(function() {
            chrome.notifications.clear(id, function() {});
        }, 5000);
    });
};

Background.prototype.refresh = function () {
	if (this.timeoutId) {
		clearTimeout(this.timeoutId);
	}
	this.initRequest();
};

Background.prototype.reset = function() {
    chrome.browserAction.setBadgeText({text: ''});
    settings('data', {});
    settings('unread', 0);
    settings('url_index', 0);
    settings('role_index', 0);
    this.refresh();
};

var background = new Background();
background.init();

// add listener for content scripts
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    switch (request.method) {
        case 'getUrls':
            sendResponse({
                urls: settings('urls')
            });
            break;
        default:
            break;
    }
});
