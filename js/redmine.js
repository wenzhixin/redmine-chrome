$(function() {

    var $header = $('#header'),
        $main = $('#main'),
        $sidebar = $('#sidebar'),
        $content = $('#content'),
        $toggle,
        hidden = localStorage && +localStorage['redmine.hidden'] || 0;

    function initView() {
        $('head').append('<link href="//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css" rel="stylesheet">');
        $toggle = $('<a href="javascript:void(0)" style="position: absolute; right: 5px; margin-top: -5px;"><i class="fa fa-angle-double-right fa-2x"></i></a>');
        $header.append($toggle);

        $toggle.click(function () {
            hidden = hidden === 0 ? 1 : 0;
            if (localStorage) localStorage['redmine.hidden'] = hidden;
            onToggle();
        });
    }

    function onToggle() {
        if (hidden) {
            hideSidebar();
        } else {
            showSidebar();
        }
    }

    function hideSidebar() {
        $toggle.find('i').removeClass('fa-angle-double-right')
            .addClass('fa-angle-double-left');
        $sidebar.hide();
        $content.css('width', '98%');
    }

    function showSidebar() {
        $toggle.find('i').removeClass('fa-angle-double-left')
            .addClass('fa-angle-double-right');
        $sidebar.show();
        $content.css('width', '75%');
    }

    function check(callback) {
        chrome.extension.sendRequest({method: 'getUrls'}, function (response) {
            var result = false;

            $.each(response.urls, function (i, url) {
                if (location.href.indexOf(url) !== -1) {
                    result = true;
                    return false;
                }
            });
            
            if (result && !$main.hasClass('nosidebar')) {
                return callback(true);
            }
            return callback(false);
        });
    }

    check(function (result) {
        if (!result) {
            return;
        }
        initView();
        onToggle();
    });
});
