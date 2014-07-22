/**
 * @author zhixin wen <wenzhixin2010@gmail.com>
 */

function Popup() {
    this.$options = $('.options');
    this.$main = $('.main');
    this.$urls = $('#urls');
    this.$roles = $('#roles');
    this.$issues = $('#issues');
    this.$detail = $('.issue-detail');
}

Popup.prototype.init = function () {
    this.initView();
    this.initUrls();
    this.initRoles();
    this.initIssues();
};

Popup.prototype.initView = function () {
    if (!settings('urls').length) {
        return;
    }
    this.$options.hide();
    this.$main.show();
};

Popup.prototype.initUrls = function () {
    var that = this,
        html = [];

    $.each(settings('urls'), function (i, url) {
        html.push(util.sprintf('<option value="%s">%s</option>', i, url));
    });
    if (settings('urls').length > 1) {
        this.$urls.show().html(html.join('')).change(function () {
            settings('url_index', $(this)[0].selectedIndex);
            that.initRoles();
            that.initIssues();
        })[0].selectedIndex = settings('url_index');
    }
};

Popup.prototype.initRoles = function () {
    var that = this,
        html = [];

    $.each(settings('roles'), function (i, role) {
        var data = settings('data')[that.getKey(role)];

        html.push(util.sprintf($('#roleTpl').html(),
            i ,
            locale['roles_' + role],
            data.issues.length,
            data.unreadList.length === 0 ? 'none' : ' ',
            data.unreadList.length
        ));
    });
    if (settings('roles').length > 1) {
        this.$roles.show().html(html.join(''))
            .find('li').click(function() {
                settings('role_index', $(this).index());
                $(this).addClass('active').siblings().removeClass('active');
                that.initIssues();
            }).eq(settings('role_index')).addClass('active');
    }
};

Popup.prototype.initIssues = function () {
    var that = this,
        html = [],
        url = settings('urls')[settings('url_index')],
        data = settings('data')[this.getKey()];

    html.push(util.sprintf($('#markTpl').html(),
        data.unreadList.length ? ' ' : 'none', locale.mark_all_read));

    $.each(data.issues, function (i, issue) {
        html.push(util.sprintf($('#issueTpl').html(),
            i,
            issue.status.name,
            issue.priority.name,
            $.inArray(util.getIuid(issue), data.unreadList) === -1 ? 'none' : '',
            issue.project.name,
            util.dateFormatter(new Date(issue.updated_on)),
            url + '/issues/' + issue.id,
            issue.tracker.name,
            issue.id,
            issue.subject
        ));
    });
    this.$issues.scrollTop(0).html(html.join(''))
        .find('.mark-all').off('click').on('click', function () {
            $(this).hide();
            that.$issues.find('.new-label').hide();
            that.setUnreadCount(0, settings('unread') - data.unreadList.length);
            that.resetUnreadData();
        }).end()
        .find('.list-group-item')
        .off('click').on('click', function () {
            var issue = data.issues[$(this).data('index')],
                index = $.inArray(util.getIuid(issue), data.unreadList);

            that.showIssue(issue);

            if (index !== -1) {
                $(".new-label", $(this)).hide();
                data.unreadList.splice(index, 1);
                that.setUnreadCount(data.unreadList.length, settings('unread') - 1);

                if (data.unreadList.length) {
                    var dataList = settings('data');
                    data.readList.push(util.getIuid(issue));
                    dataList[that.getKey()] = data;
                    settings('data', dataList);
                } else {
                    that.resetUnreadData();
                }

                // fix #11: hide mark all as read
                if (data.unreadList.length === 0) {
                    that.$roles.eq(settings('role_index')).find('.mark-all').hide();
                }
            }
        });
};

Popup.prototype.showIssue = function (issue) {console.log(issue);
    var that = this,
        url = settings('urls')[settings('url_index')] + '/issues/' + issue.id;

    issue = $.extend({}, {
        tracker: {name: ''},
        status: {name: ''},
        priority: {name: ''},
        assigned_to: {name: ''},
        author: {name: ''}
    }, issue);

    this.$main.hide();
    this.$detail.show().html(util.sprintf($('#detailTpl').html(),
            url,
            issue.tracker.name,
            issue.id,
            issue.subject,
            locale.status,
            issue.status.name,
            locale.priority,
            issue.priority.name,
            locale.assigned_to,
            issue.assigned_to.name,
            locale.author,
            issue.author.name,
            locale.description,
            issue.description
        )).find('.close').off('click').on('click', function () {
            that.$detail.hide();
            that.$main.show();
        });

    this.showAttachments(url, issue.description);
    this.showHistories(url);
};

Popup.prototype.showAttachments = function (url, description) {
    var that = this;

    $.get(url + '.json?include=attachments', function (data) {
        var pattern = /!([^!]+)!/g,
            result = null,
            attachments = data.issue.attachments;

        while ((result = pattern.exec(description)) != null) {
            var imgSrc = util.getContentUrl(result[1], attachments);
            if (imgSrc) {
                var reg = new RegExp(result[0], 'g');
                description = description.replace(reg, util.sprintf('<img src="%s">', imgSrc));
            }
        }
        description = description.replace(/\r\n/g, '<br>');
        that.$detail.find('.desc-detail').html(description);
    });
};

Popup.prototype.showHistories = function (url) {
    var that = this;

    $.get(url, function (data) {
        var $history = $(data).find('#history');

        if (!$history.length) {
            return;
        }
        $history.find('a').each(function () {
            $(this).replaceWith('<span>' + $(this).text() + '</span>');
        });
        that.$detail.append($history.html());
    });
};

Popup.prototype.setUnreadCount = function (roleCount, count) {
    var $role = this.$roles.find('li').eq(settings('role_index'));

    if (roleCount) {
        $role.find('.label-info').text(roleCount);
    } else {
        $role.find('.label-info').hide();
    }
    settings('unread', count);
    chrome.browserAction.setBadgeText({
        text: count > 0 ? count + '' : ''
    });
};

Popup.prototype.resetUnreadData = function () {
    var data = settings('data');
    data[this.getKey()].lastRead = +new Date();
    data[this.getKey()].unreadList = [];
    data[this.getKey()].readedList = [];
    settings('data', data);
};

Popup.prototype.getKey = function (role) {
    var url = settings('urls')[settings('url_index')];

    role = role || settings('roles')[settings('role_index')];
    return $.md5(url + role);
};

$(function() {
    'use strict';

    initLocale(function() {
        var popup = new Popup();
        popup.init();
    });
});