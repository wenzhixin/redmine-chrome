# Redmine Notification

Redmine notification tools for chrome extension.[![Build Status](https://travis-ci.org/wenzhixin/redmine-chrome.svg?branch=master)](https://travis-ci.org/wenzhixin/redmine-chrome)

[Install](https://chrome.google.com/webstore/detail/cenhhgabijhpobnfnmkigobcefkmhjbj)

## Features

* See the problem and the discuss directly through the plugin.
* Real time updates and automatically prompted to the problem.
* Support for multiple redmine, centralized management issues.
* Support for custom issue roles (developer and tester).
* issue status and issue number.
* Support offline viewing problems.

## Changelog

### 3.2.0 (2026-03-05)

#### Fixes

* Improved background service stability using periodInMinutes for alarms
* Added alarm keep-alive mechanism to prevent loss after SW termination
* Enhanced instance lifecycle management with proper listener removal
* Added OPTIONS_SAVED delay to ensure storage writes before reinit

#### Improvements

* Added comprehensive error handling for storage operations
* Added API request timeout (180 seconds)
* Improved error messages and logging
* Added configuration validation (url, key, issues, interval, number)
* Added "Open in new tab" button in issue list

### 3.1.3 (2025-12-14)

#### Fixes

* Fixed Service Worker invalid status that prevented issue updates
* Enhanced error handling in background script

### 3.1.1 (2025-11-19)

#### Improvements

* Added API key help text with link to Redmine account page in options
* Updated issues list view for better UI consistency

### 3.1.0 (2025-11-18)

#### Added

* Added issue filter functionality with search by subject
* Added filter UI with search input in popup header

#### Improvements

* Improved password field for API key in options page
* Optimized i18n key sorting in all language files
* Refactored filter logic in Sort component
* Updated CSS styles for better UI consistency
* Improved language detection using browser's UI language

### 3.0.2 (2025-11-16)

#### Improvements

* Update lastRead timestamp when marking issue as read
* Add Toast component for success notifications
* Display version number in options page header
* Add copy success notification when copying issue ID
* Improve copy functionality with fallback to textarea if clipboard API fails
* Add unread indicator to issue items
* Enhance UI layout and styling in popup

#### Fixes

* Fix navigation link error in popup
* Fix issue selection and copy button event handling

### 3.0.1 (2025-11-14)

#### Improvements

* Added badge checking functionality to handle background request error display
* Refactored badge checking logic into a separate method for better code structure

### 3.0.0 (2025-11-13)

#### Major Changes

* Migration from Manifest V2 to V3 using WXT framework
* Complete rewrite using Vue 3 with Composition API

#### Improvements

* Modernized build tooling (WXT, Vite, ESLint 9)
* Restructured i18n system from window.locale to ES modules
* Updated dependencies (Bootstrap 5, FontAwesome 7, dayjs, etc.)

### 2.5.0

* Added spanish locale
* Added 1 minutes update interval

### 2.4.2

* Refine options code

### 2.4.1

* Add trackers option

### 2.4.0

* Fix #51: get statuses from API

### 2.3.9

* Update toggle icon position.

### 2.3.8

* Fix update issues bug.

### 2.3.7

* Fix #23: update issues after get issue from api.
* Add json lint.
* Fix #10: add notify_status option.
* Fix #44: html notification trouble.
* Fix #43: save editor content.

### 2.3.6

* Add ja-JP support.
* Update `nav-tabs` display.

### 2.3.5

* Fix #40: Create Tool bar for comments.
* Add ja-JP support.

### 2.3.4

Fix issue update textarea name.

### 2.3.3

Fix issue detail.

### 2.3.2

Fix the keys default.

### 2.3.1

Fix undefined keys error.

### 2.3.0

Add api key support.

### 2.2.0

Fix #37: conflict between jQuery and prototype.js.

### 2.1.9

Fix #35: add status in issue list.

### 2.1.8

* Add and update go back buttons.

### 2.1.7

*  Add table classes

### 2.1.6

* Fix copy pre without code bug.

### 2.1.5

* Add 'Back to top' link.
* Add 'Copy' to pre.

### 2.1.4

* Add check redmine url and sidebar.

### 2.1.3

* Add content scripts to toggle redmine slidebar.

### 2.1.2

* Update the color of the priority label.

### 2.1.1

* Fix issue detail error!

### 2.1.0

* Fix #32: add sort issues list.

### 2.0.9

* Fix #30: update blockquote style.
* Fix #31: update issue detail use redmine detail page.

### 2.0.8

* Update textile parse lib.

### 2.0.7

* Fix textile convert bug.
* Fix notify bug.
* Fix #28: fixed the issue detail header.
* Fix #29: add status list change event.
* Fix #27: do not show notification when update the issue using extension.

### 2.0.6

* Add textile-js to parse issue description.
* Add feedback link.

### 2.0.5

* Update getIssue timeout to 1000ms.
* Add priority and assigned_to to reply form.
* Add copy issue to issues list.
* Fix notifications error.

### 2.0.4

* Fix filterIssues bug.
* Add copy issue feature.
* Do not add issue to unread list when update issue on extension.
* Fix do not show desktop notify bug.

### 2.0.3

* Add reply issue feature.
* Filter the same issue in different roles.

### 2.0.2

* Add i18n support.
* Add placeholder and check url.
* Handler unread list and count.
* Add issue attachments.
* Add histories.
* Add mark all as read.
* Update the options view.
* Update the issue item view.
* Add moment to format the update time.

### 2.0.1

* Initial release
