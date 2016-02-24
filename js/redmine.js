$(function() {

    var $body = $('body'),
        $header = $('#header'),
        $main = $('#main'),
        $sidebar = $('#sidebar'),
        $content = $('#content'),
        $toggle,
        hidden = localStorage && +localStorage['redmine.hidden'] || 0;

    function initView() {
        // toggle
        $toggle = $('<a class="plugin-toggle" href="javascript:void(0)"><i class="fa fa-angle-double-right fa-2x"></i></a>');
        $header.append($toggle);
        
        $toggle.click(function () {
            hidden = hidden === 0 ? 1 : 0;
            if (localStorage) localStorage['redmine.hidden'] = hidden;
            onToggle();
        });
        
        // back to top
        $body.append('<a class="plugin-back-to-top" href="#top" title="Back to top"><i class="fa fa-arrow-up"></i></a>');

        // check json
        $('pre code.json').each(function () {
            var text = $.map($(this).text().split('\n'), function (str) {
                    return $.trim(str);
                }).join('\n'),
                alert = '';

            try {
                checkKey(jsonlint.parse(text));
            } catch (e) {
                alert = e;
            }
            if (alert) {
                $(this).parent().after('<pre>' + alert + '</pre>');
            }
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
    
    function loadScript(url, callback) {
        // Adding the script tag to the head as suggested before
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.src = url;

        // Then bind the event to the callback function.
        // There are several events for cross browser compatibility.
        script.onreadystatechange = callback;
        script.onload = callback;

        // Fire the loading
        head.appendChild(script);
    }

    function checkKey(obj) {
        if ($.isArray(obj)) {
            $.each(obj, function (i, value) {
                checkKey(value);
            });
        }
        if ($.isPlainObject(obj)) {
            for (var key in obj) {
                if (/[A-Z]/.test(key)) {
                    throw new Error('Key "' + key + '" can not use Upper Case...');
                }
                checkKey(obj[key]);
            }
        }
    }
});
