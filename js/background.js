/**
 * @author zhixin wen <wenzhixin2010@gmail.com>
 * @date 2012-08-28
 */

var timeoutId,
	requestCount = 0,
	requestTotal = 0,
	unreadCount = 0;

function main() {
	getPage();
}

function refresh() {
	if (timeoutId) {
		clearTimeout(timeoutId);
	}
	getPage();
}

function getPage() {
	var redmineUrls = globalSettings.redmineUrls();
	var filters = globalSettings.filters();
	$.each(redmineUrls, function(i, url) {
		requestCount = 0;
		requestTotal = redmineUrls.length * filters.length;
		unreadCount = 0;
		if (filters.length == 0) {
			getList(url, globalSettings.DEFAULT_FILTER);
		} else {
			$.each(filters, function(j, filter) {
				getList(url, filter);
			});
		}
	});
	timeoutId = setTimeout(getPage, globalSettings.checkInterval() * 60 * 1000);
}

function getList(url, filter, completed) {
	var param = {
		set_filter: 1,
		assigned_to_id: "me",
		sort: "updated_on:desc",
		status_id: filter.status.join("|"),
		limit: filter.number
	};
	$.ajax({
		url : url + "/issues.json?" + $.param(param),
		type : "GET",
		timeout: 10000,
		dataType: "json",
		success : function(data) {
			var listData = globalDatas.listData(),
				key = $.md5(url + JSON.stringify(filter)),
				lastReaded = new Date(0),
				lastNotified = new Date(0);
			
			if (!listData.hasOwnProperty(key)) {
				listData[key] = new Object();
			}
			listData[key].issues = data.issues;
			if (listData[key].lastReaded) {
				lastReaded.setTime(listData[key].lastReaded);
			}
			if (listData[key].lastNotified) {
				lastNotified.setTime(listData[key].lastNotified);
			}
			var count = 0;
			for (var i = listData[key].issues.length - 1; i >= 0; i--) {
				var issue = listData[key].issues[i];
				var updatedOn = new Date(issue.updated_on);
				if (lastReaded < updatedOn) {
					count++;
				}
				if (lastNotified < updatedOn) {
					lastNotified.setTime(updatedOn.getTime());
				    if (count < 4)
				    	showNotification(issue);
				}
			};
			listData[key].lastNotified = lastNotified.getTime();
			globalDatas.listData(listData);
			unreadCount += count;
			
			requestCount++;
			checkComplete();
		},
		error: function() {
			requestCount++;
			checkComplete();
		}
	});
}

function checkComplete() {
	if (requestTotal == requestCount) {
		chrome.browserAction.setBadgeText({text: unreadCount > 0 ? unreadCount + "" : ""});
	}
}

function showNotification(issue) {
    if (webkitNotifications.checkPermission() > 0) {
    	webkitNotifications.requestPermission(showNotification);
    }
    else {
    	var n = webkitNotifications.createNotification("images/icon19.png",
							      issue.subject, issue.description);
    	n.ondisplay = function() {
    		setTimeout(function() { n.cancel() }, 10000);
    	};
		n.show();
   }
}

main();
