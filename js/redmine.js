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
        
        
        // copy
        if (!$('pre').length) {
            return;
        }
        $body.append('<div data-swf-path="' + chrome.extension.getURL('assets/ZeroClipboard.swf') + '"></div>');
        loadScript(chrome.extension.getURL('assets/jquery.min.js'), function () {    
            loadScript(chrome.extension.getURL('assets/ZeroClipboard.js'), function () {
                loadScript(chrome.extension.getURL('js/copy.js'));
            });
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
});
