/**
 * @author zhixin wen <wenzhixin2010@gmail.com>
 * @date 2012-08-29
 */

$(function() {
	
	var VIEW_REDMINE = "redmine",
		VIEW_ISSUE = "issue";
	
	function initEvents() {
		$(".back").click(function() {
			globalDatas.selectedState($(this).attr("data-view"));
			main();
		});
		$("input[name='showAll']").click(function() {
			var checked = Boolean($(this).attr("checked"));
			globalDatas.showAll(checked);
			if (checked) {
				$(".hidden_issue").show();
			} else {
				$(".hidden_issue").hide();
			}
		});
	}
	
	function main() {
		var selectedState = globalDatas.selectedState();
		switch (selectedState) {
		case VIEW_REDMINE:
			showRedmine();
			break;
		case VIEW_ISSUE:
			showIssue();
			break;
		}
	}
	
	function showRedmine() {
		var redmineUrls = globalSettings.redmineUrls();
		if (redmineUrls.length == 0) return;
		var html = "";
		$.each(redmineUrls, function(i, url) {
			html += "<li><a href='#'><i class='icon-list'></i>" + url + "</a></li>";
		});
		$(".show").children().hide();
		$(".redmine_list").html(html).show();
		$(".redmine_list a").unbind("click").bind("click", function() {
			var selectedItem = {
				redmine: $(this).text()
			};
			globalDatas.selectedItem(selectedItem);
			globalDatas.selectedState(VIEW_ISSUE);
			main();
		});
	}
	
	function showIssue() {
		var filters = globalSettings.filters(),
			roles = globalSettings.roles(),
			listData = globalDatas.listData(),
			selectedItem = globalDatas.selectedItem(),
			rolesValue = {
				assigned_to_id: "指派给我的问题",
				author_id: "我报告的问题",
				watcher_id: "我跟踪的问题"
			},
			html = "";

		if (filters.length == 0) {
			filters.push(globalSettings.DEFAULT_FILTER);
		}
		$.each(filters, function(i, filter) {
			$.each(roles, function(j, role) {
				filter.role = role;
				var key = $.md5(selectedItem.redmine + JSON.stringify(filter));
				html += "<option value='" + key + "' data-index='" + i + "'>";
				html += filter.name + "-" + rolesValue[role] + "(" + listData[key].issues.length + ")";
				html += "</option>";
			});
		});
		
		$("input[name='showAll']").attr("checked", globalDatas.showAll());

		var curkey = $.md5(selectedItem.redmine + JSON.stringify(selectedItem.filter));
		if (!listData.hasOwnProperty(curkey)) {
			var curFilter = filters[0];
			curFilter.role = roles[0];
			curkey = $.md5(selectedItem.redmine + JSON.stringify(curFilter));
		}
		
		$(".issue_list select").unbind("change").bind("change", function() {
			showIssueList(listData, $(this).val());
			
			selectedItem.filter = filters[$(this).find("option:checked").attr("data-index")];
			globalDatas.selectedItem(selectedItem);
		}).html(html).val(curkey);
		showIssueList(listData, curkey);
	}
	
	function showIssueList(listData, curkey) {
		var data = listData[curkey];
		var issues = data.issues;
		if (issues.length == 0) return;
		showUnreadCount(data.unreadList.length);
		var showHtml = "";
		var hiddenHtml = "";
		$.each(issues, function(i, issue) {
			var html = "",
				isShowItem = $.inArray(issue.id, globalDatas.hiddenItems()) == -1;
			html += "<li data-index='" + i + "'";
			if (!isShowItem) {
				html += " class='hidden_issue" + (globalDatas.showAll() ? "'" : " none'");
			}
			html += ">";
			html += "<a href='#'>";
			html += "<div>";
			html += "<div class='fb fl'>";
			html += issue.status.name + " | " + issue.priority.name + "</div>";
			if ($.inArray(util.getIuid(issue), data.unreadList) != -1) {
				html += "<span class='new_issue ml5 badge badge-warning'>new</span>";
			}
			if (isShowItem) {
				html += "<i class='icon-eye-close ml5' title='隐藏该问题'></i>";
			} else {
				html += "<i class='icon-eye-open ml5' title='还原该问题'></i>";
			}
			html += "<div class='fr'>" + "<span class='fb mr10'>" + issue.project.name + "</span>";
			html += util.dateFormatter(new Date(issue.updated_on)) + "</div>";
			html += "</div>";
			html += "<div class='cb mt10'>";
			html += issue.tracker.name + " #" + issue.id + ": " + issue.subject + "</div>";
			html += "</a></li>";
			if (isShowItem) {
				showHtml += html;
			} else {
				hiddenHtml += html;
			}
		});
		$(".show").children().hide();
		$(".issue_list").show();
		$(".issue_list ul").html(showHtml + hiddenHtml);
		$(".issue_list li").unbind("click").bind("click", function() {
			var issue = issues[$(this).attr("data-index")];
			showDetail(issue);

			var index = $.inArray(util.getIuid(issue), data.unreadList);
			if (index != -1) {
				setGlobalUnreadCount(globalDatas.unreadCount() - 1);
				
				$(".new_issue", $(this)).remove();
				data.unreadList.splice(index, 1);
				if (data.unreadList.length == 0) {
					resetUnreadCount(listData, curkey);
				} else {
					data.readedList.push(util.getIuid(issue));
					listData[curkey] = data;
					globalDatas.listData(listData);
				}
			}
		}).unbind("mouseover").bind("mouseover", function() {
			$("i.icon-eye-close, i.icon-eye-open", $(this)).show();
		}).unbind("mouseout").bind("mouseout", function() {
			$("i.icon-eye-close, i.icon-eye-open", $(this)).hide();
		});
		$("#unreadCount").unbind("click").bind("click", function() {
			setGlobalUnreadCount(globalDatas.unreadCount() - listData[curkey].unreadList.length);
			resetUnreadCount(listData, curkey);
			main();
		});
		$("i.icon-eye-close, i.icon-eye-open").hide().unbind("click").bind("click", function(event) {
			event.stopPropagation();
			var $li = $(this).parents("li");
			$li.appendTo($(".issue_list ul"));
			$li.addClass("hidden_issue");
			if (!globalDatas.showAll()) {
				$li.addClass("none");
			}
			var issue = issues[$li.attr("data-index")];
			var items = globalDatas.hiddenItems();
			items.push(issue.id);
			globalDatas.hiddenItems(items);
		});
		$("i.icon-eye-open").hide().unbind("click").bind("click", function(event) {
			event.stopPropagation();
			var $li = $(this).parents("li");
			$li.removeClass("hidden_issue");
			$li.prependTo($(".issue_list ul"));
			if (!globalDatas.showAll()) {
				$li.removeClass("none");
			}
			var issue = issues[$li.attr("data-index")];
			var items = globalDatas.hiddenItems();
			var index = $.inArray(issue.id, items);
			items.splice(index, 1);
			globalDatas.hiddenItems(items);
		});
	}
	
	function resetUnreadCount(listData, curkey) {
		listData[curkey].lastReaded = new Date().getTime();
		listData[curkey].unreadList = new Array();
		listData[curkey].readedList = new Array();
		globalDatas.listData(listData);
	}
	
	function setGlobalUnreadCount(count) {
		globalDatas.unreadCount(count);
		chrome.browserAction.setBadgeText({text: count > 0 ? count + "" : ""});
	}
	
	function showUnreadCount(count) {
		//显示未读条数
		if (count == 0) {
			$("#unreadCount").hide();
		} else {
			$("#unreadCount").text(count).show();
		}
	}
	
	function showDetail(issue) {
		var issueUrl = globalDatas.selectedItem().redmine + "/issues/" + issue.id;
		var html = "";
		html += "<h4><a href='" + issueUrl + "' target='_blank'>";
		html += issue.tracker.name + " #" + issue.id + ": " + issue.subject + "</a></h4>";
		html += "<div><div class='ditem'><b>状态：</b>" + issue.status.name + "</div>";
		html += "<div class='ditem'><b>优先级：</b>" + issue.priority.name + "</div>";
		html += "<div class='ditem'><b>指派给：</b>" + issue.assigned_to.name + "</div>";
		html += "<div class='ditem'><b>作者：</b>" + issue.author.name + "</div></div>";
		html += "<div class='description tline cl'><h5>描述：</h5>" + issue.description.replace(/\r\n/g, "<br/>") + "</div>";
		$(".show").children().hide();
		$(".issue_detail").show();
		$("#detail").html(html);
		
		//get attachments
		$.ajax({
			url: issueUrl + ".json?include=attachments",
			type: "get",
			timeout: 10000,
			success: function(data) {
				var pattern = /!([^!]+)!/g,
					result = null,
					description = issue.description,
					attachments = data.issue.attachments;
				while ((result = pattern.exec(description)) != null) {
					var imgSrc = util.getContentUrl(result[1], attachments);
					if (imgSrc) {
						var reg = new RegExp(result[0],"g");
						description = description.replace(reg, "<img src='" + imgSrc + "' />");
					}
				}
				$("#detail .description").html("<h5>描述：</h5>" + description.replace(/\r\n/g, "<br/>"));
			}
		});
		
		//get history
		$.ajax({
			url: issueUrl,
			type: "get",
			timeout: 10000,
			success: function(data) {
				var $history = $(data).find("#history");
				if ($history.length == 0) return;
				$("a", $history).each(function() {
					$(this).replaceWith("<span>" + $(this).text() + "</span>");
				});
				$("img.gravatar", $history).remove();
				var html = "<div class='history tline'>" + $history.html() + "</div>";
				$("#detail").append(html);
			}
		});
	}
	
	initEvents();
	main();
});