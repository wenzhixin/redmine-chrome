/**
 * @author zhixin wen <wenzhixin2010@gmail.com>
 * @date 2012-08-28
 */

/**
 * 全局设置
 */ 
var globalSettings = {
	/**
	 * redmine 地址(Array)
	 */
	redmineUrls: function(values) {
		if (values) {
			localStorage["scutech.redmineUrls"] = JSON.stringify(values);
		} else {
			if (!localStorage["scutech.redmineUrls"])
				return [];
			return JSON.parse(localStorage["scutech.redmineUrls"]);
		}
	},
	/**
	 * 添加 redmine
	 */
	addRedmine: function(value) {
		var urls = this.redmineUrls();
		if (value.charAt(value.length - 1) == "/") {
			value = value.substring(0, value.length -1);
		}
		urls.push(value);
		this.redmineUrls(urls);
	},
	/**
	 * 更新 redmine
	 */
	updateRedmine: function(index, value) {
		var urls = this.redmineUrls();
		if (value.substring(value.length - 1) == "/") {
			value = value.substring(0, value.length -1);
		}
		urls[index] = value;
		this.redmineUrls(urls);
	},
	/**
	 * 删除 redmine
	 */
	deleteRedmine: function(index) {
		var urls = this.redmineUrls();
		urls.splice(index, 1);
		this.redmineUrls(urls);
	},
	
	DEFAULT_FILTER: {name: "默认", status: ["*"], number: 100},
	
	/**
	 * 过滤器(Array)
	 */
	filters: function(values) {
		if (values) {
			localStorage["scutech.filters"] = JSON.stringify(values);
		} else {
			if (!localStorage["scutech.filters"])
				return [];
			return JSON.parse(localStorage["scutech.filters"]);
		}
	},
	/**
	 * 添加过滤器
	 */
	addFilter: function(value) {
		var urls = this.filters();
		urls.push(value);
		this.filters(urls);
	},
	/**
	 * 更新过滤器
	 */
	updateFilter: function(index, value) {
		var urls = this.filters();
		urls[index] = value;
		this.filters(urls);
	},
	/**
	 * 删除过滤器
	 */
	deleteFilter: function(index) {
		var urls = this.filters();
		urls.splice(index, 1);
		this.filters(urls);
	},
	
	/**
	 * 指派给我的问题： assigned_to_id
	 * 我报告的问题： author_id
	 * 我跟踪的问题： watcher_id
	 */
	roles: function(value) {
		if (value) {
			localStorage["scutech.roles"] = JSON.stringify(value);
		} else {
			if (!localStorage["scutech.roles"])
				return ["assigned_to_id"];
			return JSON.parse(localStorage["scutech.roles"]);
		}
	},
	
	/**
	 * 桌面通知
	 */
	desktopNotify: function(value) {
		if (typeof value == "boolean") {
			localStorage["scutech.desktopNotify"] = JSON.stringify(value);
		} else {
			if (!localStorage["scutech.desktopNotify"])
				return true;
			return JSON.parse(localStorage["scutech.desktopNotify"]);
		}
	},
	
	/**
	 * 检查时间间隔(int)：默认为5分钟
	 */
	checkInterval: function(value) {
		if (value) {
			localStorage["scutech.checkInterval"] = value;
		} else {
			if (!localStorage["scutech.checkInterval"])
				return 5;
			return localStorage["scutech.checkInterval"];
		}
	},
	
	newFlag: function(flag) {
		if (flag) {
			localStorage["scutech.newFlag"] = flag;
		} else {
			if (!localStorage["scutech.newFlag"])
				return null;
			return localStorage["scutech.newFlag"];
		}
	}
};

/**
 * 全局数据
 */
var globalDatas = {
	/**
	 * 列表数据(Object)
	 */
	listData: function(data) {
		if (data) {
			localStorage["scutech.listData"] = JSON.stringify(data);
		} else {
			if (!localStorage["scutech.listData"])
				return {};
			return JSON.parse(localStorage["scutech.listData"]);
		}
	},
	
	unreadCount: function(value) {
		if (typeof value == "number") {
			if (value < 0) value = 0;
			localStorage["scutech.unreadCount"] = value;
		} else {
			if (!localStorage["scutech.unreadCount"])
				return 0;
			return parseInt(localStorage["scutech.unreadCount"]);
		}
	},
	
	selectedState: function(state) {
		if (state) {
			localStorage["scutech.selectedState"] = state;
		} else {
			if (!localStorage["scutech.selectedState"])
				return "redmine";
			return localStorage["scutech.selectedState"];
		}
	},
	
	selectedItem: function(data) {
		if (data) {
			localStorage["scutech.selectedItem"] = JSON.stringify(data);
		} else {
			if (!localStorage["scutech.selectedItem"])
				return {};
			return JSON.parse(localStorage["scutech.selectedItem"]);
		}
	},
	
	hiddenItems: function(data) {
		if (data) {
			localStorage["scutech.hiddenItems"] = JSON.stringify(data);
		} else {
			if (!localStorage["scutech.hiddenItems"])
				return [];
			return JSON.parse(localStorage["scutech.hiddenItems"]);
		}
	},
	
	showAll: function(value) {
		if (typeof value == "boolean") {
			localStorage["scutech.showAll"] = JSON.stringify(value);
		} else {
			if (!localStorage["scutech.showAll"])
				return false;
			return JSON.parse(localStorage["scutech.showAll"]);
		}
	}
};

var util = {
	dateFormatter: function(date) {
		var y = date.getFullYear();
		var m = date.getMonth() + 1;
		var d = date.getDate();
		var h = date.getHours();
		var mm = date.getMinutes();
		var s = date.getSeconds();
		return y + '-' + (m < 10 ? ('0' + m) : m) + '-'
				+ (d < 10 ? ('0' + d) : d) + " " + (h < 10 ? ('0' + h) : h)
				+ ":" + (mm < 10 ? ('0' + mm) : mm) + ":"
				+ (s < 10 ? ('0' + s) : s);
	},
	
	getIuid: function(issue) {
		return issue.id + new Date(issue.updated_on).getTime();
	},
	
	getContentUrl: function(value, attachments) {
		for (var i = 0; i < attachments.length; i++) {
			var attachment = attachments[i];
			if (value == attachment.filename) {
				return attachment.content_url;
			}
		}
		return null;
	}
};