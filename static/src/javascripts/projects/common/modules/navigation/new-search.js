define([
    'common/utils/$'
], function (
    $
) {

    // If enhanced, search the query alongside our website
    function editUrlToSearch (event) {
        event.preventDefault();

        var input = $('.js-get-search-term')[0];

        if (input) {
            var searchQueryParameters = '?as_sitesearch=www.theguardian.com&q=' + input.value;

            location.href = 'https://www.google.co.uk/search' + searchQueryParameters;
        }
    }

    function addSearchEventListener() {
        var form = $('.js-search-google')[0];

        if (form) {
            form.onsubmit = editUrlToSearch;
        }
    }

    return addSearchEventListener;
});
