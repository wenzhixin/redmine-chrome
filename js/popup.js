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
    this.$issues.scrollTop(0).html(html.join('')).find('.list-group-item').off('click').on('click', function () {
        var issue = data.issues[$(this).data('index')];

        that.showIssue(issue);
    });
};

Popup.prototype.showIssue = function (issue) {
    var that = this,
        url = settings('urls')[settings('url_index')];

    issue = $.extend({}, {
        tracker: {name: ''},
        status: {name: ''},
        priority: {name: ''},
        assigned_to: {name: ''},
        author: {name: ''}
    }, issue);

    this.$main.hide();
    this.$detail.show().html(util.sprintf($('#detailTpl').html(),
            url + '/issues/' + issue.id,
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
};

Popup.prototype.getKey = function (role) {
    var url = settings('urls')[settings('url_index')];

    role = role || settings('roles')[settings('role_index')];
    return $.md5(url + role);
};

$(function() {
    'use strict';

    var popup = new Popup();
    popup.init();
});