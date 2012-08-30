/**
 * @author zhixin wen <wenzhixin2010@gmail.com>
 * @date 2012-08-28
 */

$(function() {
	
	var TYPE_REDMINE 	= "redmine",
		TYPE_FILTER 	= "filter",
		TYPE_ADD 		= "add",
		TYPE_UPDATE		= "update",
		TYPE_DELETE		= "delete";
	
	var $addRedmine 	= $("#addRedmine"),
		$addFilter		= $("#addFilter"),
		$alert			= $("#alert"),
		$redmineModal 	= $("#redmineModal"),
		$filterModal	= $("#filterModal"),
		$confirmModal	= $("#confirmModal"),
		$remineList 	= $("#remineList"),
		$filterList		= $("#filterList"),
		$updateBtn 		= $(".update_btn"),
		$deleteBtn 		= $(".delete_btn");
	
	var listItem 	= $("#listItem").html();
	
	function main() {
		initEvents();
		initList();
	}
	
	function initList() {
		$remineList.html("");
		var redmineUrls = globalSettings.redmineUrls();
		$.each(redmineUrls, function(index, redmineUrl) {
			var data = {type: TYPE_REDMINE, index: index, value: redmineUrl};
			$(listItem).appendTo($remineList).data("data", JSON.stringify(data))
				.find("input[name='redmineUrl']").val(redmineUrl);
		});
		
		$filterList.html("");
		var filters = globalSettings.filters();
		$.each(filters, function(index, filter) {
			var data = {type: TYPE_FILTER, index: index, value: filter};
			var $filter = $(listItem).appendTo($filterList).data("data", JSON.stringify(data))
				.find("input[name='redmineUrl']").val(filter.name + " | 状态：" + filter.status 
				+ " | 显示：" + filter.number + "条");
		});
		
		chrome.extension.getBackgroundPage().refresh();
	}
	
	function initEvents() {
		$addRedmine.click(function() {
			showRedmineDialog(TYPE_ADD);
		});
		$addFilter.click(function() {
			showFilterDialog(TYPE_ADD);
		});
		$updateBtn.live("click", function() {
			var data = JSON.parse($(this).parent("div").data("data"));
			switch (data.type) {
			case TYPE_REDMINE:
				showRedmineDialog(TYPE_UPDATE, data);
				break;
			case TYPE_FILTER:
				showFilterDialog(TYPE_UPDATE, data);
				break;
			}
		});
		$deleteBtn.live("click", function() {
			var data = JSON.parse($(this).parent("div").data("data"));
			showConfirmDialog(data.type, data);
		});
	}
	
	function showAlert(message) {
		$(".message", $alert).text(message);
		var timeoutId = $alert.data("timeoutId");
		clearTimeout(timeoutId);
		timeoutId = setTimeout(function() {
			$alert.hide();
		}, 3000);
		$alert.show().alert().data("timeoutId", timeoutId);
	}
	
	function showRedmineDialog(type, data) {
		$redmineModal.modal();
		var $url = $("input[name='redmineUrl']", $redmineModal);
		var title = "";
		var value = "";
		switch (type) {
		case TYPE_ADD:
			title = "添加Redmine地址";
			break;
		case TYPE_UPDATE:
			title = "修改Redmine地址";
			value = data.value;
			break;
		}
		$("h3", $redmineModal).text(title);
		$url.val(value);

		$(".ok", $redmineModal).unbind("click").bind("click", function() {
			var url = $.trim($("input[name='redmineUrl']", $redmineModal).val());
			if (url == "") {
				$url.focus();
				return;
			}
			switch (type) {
			case TYPE_ADD:
				globalSettings.addRedmine(url);
				showAlert("添加Redmine成功！");
				break;
			case TYPE_UPDATE:
				globalSettings.updateRedmine(data.index, url);
				showAlert("更新Redmine成功！");
				break;
			}
			initList();
			$redmineModal.modal("hide");
		});
		$(".cancel", $redmineModal).unbind("click").bind("click", function() {
			$redmineModal.modal("hide");
		});
	}
	
	function showFilterDialog(type, data) {
		$filterModal.modal();
		var $name = $("input[name='name']", $filterModal);
		var $status = $("select[name='status']", $filterModal);
		var $number = $("select[name='number']", $filterModal);
		var title = "";
		var filter = {name: "", status: ["1"], number: 100};
		switch (type) {
		case TYPE_ADD:
			title = "添加过滤规则";
			break;
		case TYPE_UPDATE:
			title = "修改过滤规则";
			filter = data.value;
			break;
		}
		$("h3", $filterModal).text(title);
		$name.val(filter.name);
		$status.val(filter.status);
		$number.val(filter.number);
		
		$(".ok", $filterModal).unbind("click").bind("click", function() {
			var filter = new Object();
			filter.name = $.trim($name.val());
			if (filter.name == "") {
				$name.focus();
				return;
			}
			filter.status = $status.val();
			if (!filter.status) {
				$status.focus();
				return;
			}
			filter.number = $number.val();
			switch (type) {
			case TYPE_ADD:
				globalSettings.addFilter(filter);
				showAlert("添加过滤规则成功！");
				break;
			case TYPE_UPDATE:
				globalSettings.updateFilter(data.index, filter);
				showAlert("更新过滤规则成功！");
				break;
			}
			initList();
			$filterModal.modal("hide");
		});
		$(".cancel", $filterModal).unbind("click").bind("click", function() {
			$filterModal.modal("hide");
		});
	}
	
	function showConfirmDialog(type, data) {
		$confirmModal.modal();
		var message = "";
		switch (type) {
		case TYPE_REDMINE:
			message = "确定删除该Redmine：" + data.value + "？";
			break;
		case TYPE_FILTER:
			message = "确定删除该过滤规则：" + data.value.name + "？";
			value = data.value;
			break;
		}
		$(".message", $confirmModal).text(message);

		$(".ok", $confirmModal).unbind("click").bind("click", function() {
			switch (type) {
			case TYPE_REDMINE:
				globalSettings.deleteRedmine(data.index);
				showAlert("删除Redmine成功！");
				break;
			case TYPE_FILTER:
				globalSettings.deleteFilter(data.index);
				break;
			}
			initList();
			$confirmModal.modal("hide");
		});
		$(".cancel", $confirmModal).unbind("click").bind("click", function() {
			$confirmModal.modal("hide");
		});
	}

	main();
});