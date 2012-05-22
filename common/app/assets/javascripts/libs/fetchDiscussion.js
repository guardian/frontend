define(["reqwest", guardian.js.modules.basicTemplate], function(reqwest, basicTemplate) {

    // util for comment datastamps
    function formatDate(d) {
        var day = d.getDate();
        var month = d.getMonth();
        var year = d.getFullYear();
        var minutes = d.getMinutes();
        var hours = d.getHours();
        var monthName = '';
        var meridian = 'AM';

        // javascript's date module is a horrible joke. observe:

        // it 0-bases months...
        month = month + 1;

        // ...but it doesn't 0-base minutes.
        if (minutes <= 9) {
            minutes = '0' + minutes;
        }

        // it can't do 12 hour clock.
        if (hours > 12) {
            hours = hours-12;
            meridian = 'PM';
        }

        // and of course, it doesn't know anything about month *names*
        switch(month) {
            case 1:
                monthName = 'Jan';
                break;
            case 2:
                monthName = 'Feb';
                break;
            case 3:
                monthName = 'March';
                break;
            case 4:
                monthName = 'April';
                break;
            case 5:
                monthName = 'May';
                break;
            case 6:
                monthName = 'June';
                break;
            case 7:
                monthName = 'July';
                break;
            case 8:
                monthName = 'Aug';
                break;
            case 9:
                monthName = 'Sep';
                break;
            case 10:
                monthName = 'Oct';
                break;
            case 11:
                monthName = 'Nov';
                break;
            case 12:
                monthName = 'Dec';
                break;
            
        }

        return day + ' ' + monthName + ' ' + year + ', ' + hours + ':' + minutes + ' ' + meridian;
    }

    function formatJson(json) {
        var html = '';
        var commentTemplate = '<div class="line b1"><div class="unit size1of3"><p><strong><a href="{0}">{1}</a></strong></p></div><div class="unit lastUnit"><p class="datestamp">{2}</p></div></div><div class="line"><div class="unit size1of1">{3}</div></div>';
        var avatarTemplate = ' <a href="{0}"><img class="badge" src="{1}" alt="{2}" /></a>';

        for (var i in json.discussion.comments) {
            var c = json.discussion.comments[i];
            var username = c.userProfile.displayName;
            var date = c.date;

            // i hate you, javascript.
            date = date.replace(/-/g, '/');
            date = date.split('.');
            date = date[0];
            var datestamp = new Date(date);
            datestamp = formatDate(datestamp);

            if (c.userProfile.badge) {
                for (var j in c.userProfile.badge) {
                    var b = c.userProfile.badge[j];
                    username += basicTemplate.format(avatarTemplate, '#', b.imageUrl, b.name);
                }
            }
            html += basicTemplate.format(commentTemplate, '#', username, datestamp, c.body);
        }
        return html;
    }

    function buildUrl(shortUrl) {
        var urlBase = 'http://coddisapi01.gudev.gnl:8900/discussion-api/discussion/';
        shortUrl = shortUrl.replace("http://gu.com", "");
        return urlBase + shortUrl;
    }

    function buildExpander(commentsPerPage, commentsLeft) {
        var html = '<h4><a id="js-discussion-expander" href="javascript://">Load ' + commentsPerPage + ' more comments ... <span class="count">' + commentsLeft + ' more</span></h4>';
        return html;
    }

    function fetchCommentsForContent(shortUrl, commentsPerPage, pageOffset, callback) {
        var status = 'error'; // glass half-empty
        var hasMoreCommentsToShow = false;
        var expanderHtml = '';
        var html = '';

        // fetch comments for article (if available)
        if (guardian.page.commentable) {

            // make discussion URL
            var discussionAjaxUrl = buildUrl(shortUrl);

            // add parameters
            var params = 'pageSize=' + commentsPerPage;
            if (pageOffset) {
                params += '&page=' + pageOffset;
            }
            
            // fetch via ajax
            reqwest({
                url: discussionAjaxUrl + '?' + params + '&callback=?',
                type: 'jsonp',
                jsonpCallback: 'callback',
                jsonpCallbackName: 'showArticleComments',
                success: function(json) {
                    if (json.status !== 'error' && json.discussion.commentCount > 0) {
                      
                        status = 'success';
                        // build our HTML response
                        html = formatJson(json);
                        var htmlHeader = '<h4>Comments <span class="count">' + json.discussion.commentCount + '</span></h4>';

                        var totalComments = json.discussion.commentCount;
                        var currentCommentsDisplayed = commentsPerPage * pageOffset;
                        if (totalComments > currentCommentsDisplayed) {
                            hasMoreCommentsToShow = true;
                            var numLeft = totalComments - currentCommentsDisplayed;
                            expanderHtml = buildExpander(commentsPerPage, numLeft);
                        }

                        // now pass the html onto our callback
                        callback({ 
                            status: status, 
                            html: html,
                            htmlHeader: htmlHeader,
                            expanderHtml: expanderHtml,
                            hasMoreCommentsToShow: hasMoreCommentsToShow,
                            currentPage: pageOffset,
                            commentsPerPage: commentsPerPage
                        });
                        // todo: work out if we need an expander, reflect that in json
                    }
                }
            });
        } // end of commentable check   
    }

    return {
        fetchCommentsForContent: fetchCommentsForContent
    }

});