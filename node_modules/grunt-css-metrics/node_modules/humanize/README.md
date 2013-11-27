# humanize #

Javascript data formatter for human readability.

Idea, name, and initial code blatently stolen from [milanvrekic/JS-humanize](http://github.com/milanvrekic/JS-humanize)

Can be loaded via AMD or in node directly.

## Installation ##

    npm install humanize

## Usage: ##
```javascript
var humanize = require('humanize');
humanize.date('Y-m-d'); // 'yyyy-mm-dd'
humanize.filesize(1234567890); // '1.15 Gb'
```

## Functions available: ##

####humanize.noConflict()####
Give control of the "humanize" variable back to its previous owner. Returns a reference to the humanize object.

####humanize.time()####
Retrieves the current time in seconds

####humanize.date(format [, timestamp / JS Date Object = new Date()])####
This is a port of [php.js date](http://phpjs.org/functions/date:380) and behaves exactly like [PHP's date](http://php.net/manual/en/function.date.php)

####humanize.numberFormat(number [, decimals = 2, decPoint = '.', thousandsSep = ','])####
Format a number to have decimal significant decimal places, using decPoint as the decimal separator, and thousandsSep as thousands separater

####humanize.naturalDay(timestamp [, format = 'Y-m-d'])####
Returns 'today', 'tomorrow' or 'yesterday', as appropriate, otherwise format the date using the passed format with humanize.date()

####humanize.relativeTime(timestamp)####
Returns a relative time to the current time, seconds as the most granular up to years to the least granular.

####humanize.ordinal(integer)####
Converts a number into its [ordinal representation](http://en.wikipedia.org/wiki/Ordinal_number_\(linguistics\)).

####humanize.filesize(filesize [, kilo = 1024, decimals = 2, decPoint = '.', thousandsSep = ',']) ####
Converts a byte count to a human readable value using kilo as the basis, and numberFormat formatting

####humanize.linebreaks(string)####
Converts a string's newlines into properly formatted html ie. one new line -> br, two new lines -> p, entire thing wrapped in p

####humanize.nl2br(string)####
Converts a string's newlines into br's

####humanize.truncatechars(string, length)####
Truncates a string to length-1 and appends '…'. If string is shorter than length, then no-op

####humanize.truncatewords(string, numWords)####
Truncates a string to only include the first numWords words and appends '…'. If string has fewer words than newWords, then no-op
