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
			listData = globalDatas.listData(),
			selectedItem = globalDatas.selectedItem(),
			html = "";

		if (filters.length == 0) {
			filters.push(globalSettings.DEFAULT_FILTER);
		}
		
		$.each(filters, function(i, filter) {
			var key = $.md5(selectedItem.redmine + JSON.stringify(filter));
			html += "<option value='" + key + "'>" + filter.name + "(" + listData[key].issues.length + ")" + "</option>";
		});

		if (!selectedItem.hasOwnProperty("filter")) {
			selectedItem.filter = filters[0];
		}
		var curkey = $.md5(selectedItem.redmine + JSON.stringify(selectedItem.filter));
		$(".issue_list select").unbind("change").bind("change", function() {
			showIssueList(listData, $(this).val());
		}).html(html).val(curkey);
		showIssueList(listData, curkey);
	}
	
	function showIssueList(listData, curkey) {
		var data = listData[curkey];
		var issues = data.issues;
		if (issues.length == 0) return;
		showUnreadCount(data.unreadList.length);
		var html = "";
		$.each(issues, function(i, issue) {
			html += "<li data-index='" + i + "'>";
			html += "<a href='#'>";
			html += "<div>";
			html += "<div class='fb fl'>";
			html += issue.status.name + " | " + issue.priority.name + "</div>";
			if ($.inArray(util.getIuid(issue), data.unreadList) != -1) {
				html += "<span class='new_issue ml5 badge badge-warning'>new</span>";
			}
			html += "<div class='fr'>" + "<span class='fb mr10'>" + issue.project.name + "</span>";
			html += util.dateFormatter(new Date(issue.updated_on)) + "</div>";
			html += "</div>";
			html += "<div class='cb mt10'>";
			html += issue.tracker.name + " #" + issue.id + ": " + issue.subject + "</div>";
			html += "</a></li>";
		});
		$(".show").children().hide();
		$(".issue_list").show();
		$(".issue_list ul").html(html);
		$(".issue_list li").unbind("click").bind("click", function() {
			var issue = issues[$(this).attr("data-index")];
			showDetail(issue);

			var index = $.inArray(util.getIuid(issue), data.unreadList);
			if (index != -1) {
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
		});
		$("#unreadCount").unbind("click").bind("click", function() {
			resetUnreadCount(listData, curkey);
			main();
		});
	}
	
	function resetUnreadCount(listData, curkey) {
		listData[curkey].lastReaded = new Date().getTime();
		listData[curkey].unreadList = new Array();
		listData[curkey].readedList = new Array();
		globalDatas.listData(listData);
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
		html += "<div class='tline cl'><h5>描述：</h5>" + issue.description.replace(/\r\n/, "<br/>") + "</div>";
		$(".show").children().hide();
		$(".issue_detail").show();
		$("#detail").html(html);
		
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
		})
	}
	
	initEvents();
	main();
});