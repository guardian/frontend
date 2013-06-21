define(['Reqwest', 'common', 'bean', 'bonzo', 'js!html5sortable'], function(reqwest, common, bean, bonzo) {

    return function(selector) {

        var doc = document,
            searchSelector = selector + '__search',
            articlesSelector = selector + '__articles';

        function addArticle(article) {

            bonzo(doc.querySelector(articlesSelector))
                .append('<li><span>' + article + '</span><button class="btn btn-danger">X</button></li>');
            $(articlesSelector).sortable();

        };

        function searchInit() {

            bean.one(doc.querySelector(searchSelector), 'keydown', function() {
                $(searchSelector).typeahead({
                    matcher: function() {
                        return true;
                    },
                    sorter: function(items) {
                        return items;
                    },
                    updater: function(item) {
                        addArticle(item);
                    },
                    source: function(query, process) {
                        reqwest({
                            jsonpCallback: 'callback',
                            jsonpCallbackName: 'search',
                            url: 'http://content.guardianapis.com/search?format=json&show-fields=all&pageSize=5&q=' + query,
                            type: 'jsonp',
                            success: function(resp) {
                                var articles = resp.response.results.map(function(article) {
                                    return article.webTitle;
                                });
                                process(articles);
                            }
                        });
                    }
                });
            });

        }

        function saveInit() {

            bean.on(doc.querySelector(selector + '__save'), 'click', function(e) {
                var articles = Array.prototype.map.call(doc.querySelectorAll('.top-stories__articles li span'), function(article) {
                    return article.textContent;
                });
                reqwest({
                    contentType: 'application/json',
                    url: '/fronts/top-stories',
                    type: 'json',
                    method: 'post',
                    data: JSON.stringify({
                        articles: articles.map(function(article) {
                            return {
                                id: article
                            };
                        })
                    })
                }).then(
                    function() {
                        bonzo(doc.querySelector('h1'))
                            .before('<div class="alert alert-success fade in">Saved</div>');
                        window.setTimeout(function() {
                            $('.alert').alert('close');
                        }, 2000);
                    },
                    function() {}
                );
            });

        }

        function deleteInit() {

            bean.on(doc.querySelector(selector + '__articles'), 'click', 'button', function(e) {
                bonzo(bonzo(this).parent()).remove();
            });

        }

        this.init = function(callback) {

            reqwest({
                url: '/fronts/top-stories',
                type: 'json'
            }).then(
                function(resp) {
                    if (resp.articles) {
                        resp.articles.forEach(function(article) {
                            addArticle(article.id);
                        });
                    }
                    searchInit();
                    saveInit();
                    deleteInit();

                    if (typeof callback === 'function') {
                        callback(this);
                    }
                }
            );

        };

    };

});
