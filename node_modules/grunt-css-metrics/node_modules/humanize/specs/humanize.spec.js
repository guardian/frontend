var should = require('should');
var humanize = require('../humanize');
process.env.TZ = 'America/Los_Angeles';

describe('humanize:', function() {

  describe('#pad', function() {
    it('should be able to pad on the left', function() {
      humanize.pad(123, 4, '0').should.equal('0123');
      humanize.pad('abcd', 3, 'c').should.equal('abcd');
      humanize.pad('cool', 7, 'Blah').should.equal('BBBcool');
    });

    it('should be able to pad on the right', function() {
      humanize.pad(123, 4, '0', 'right').should.equal('1230');
      humanize.pad('abcd', 3, 'c', 'right').should.equal('abcd');
      humanize.pad('cool', 7, 'Blah', 'right').should.equal('coolBBB');
    });
  });


  describe('#time', function() {
    it('should be able to get the current time', function() {
      // I'm not sure how to make this better yet ...
      parseInt(humanize.time()).should.equal(parseInt(new Date().getTime() / 1000, 10));
    });
  });

  describe('#date', function() {
    var timestamps = require('./dateData.js')().timestamps;

    it('should be able to accept timestamp, js date object, or nothing', function() {
      var timestamp = 514088627;
      var today = new Date();
      humanize.date('Y-m-d').should.equal(today.getFullYear() + '-' + humanize.pad(today.getMonth() + 1, 2, '0') + '-' + humanize.pad(today.getDate(), 2, '0'));
      humanize.date('Y-m-d', timestamp).should.equal('1986-04-16');
      humanize.date('Y-m-d', new Date(timestamp * 1000)).should.equal('1986-04-16');
    });

    it('should be able to print out escaped characters', function() {
      var timestamp = 514088627;
      var today = new Date();
      humanize.date('Y-m-d\\Y\\z\\d').should.equal(today.getFullYear() + '-' + humanize.pad(today.getMonth() + 1, 2, '0') + '-' + humanize.pad(today.getDate(), 2, '0') + 'Yzd');
      humanize.date('Y-m-d\\Y\\z\\d', timestamp).should.equal('1986-04-16Yzd');
      humanize.date('Y-m-d\\Y\\z\\d', new Date(timestamp * 1000)).should.equal('1986-04-16Yzd');
    });

    it('should be able to replace correct information', function() {
      for (var timestamp in timestamps) {
        for (var dateVal in timestamps[timestamp]) {
          var info = 'timestamp: ' + timestamp + ' dateVal: ' + dateVal;
          humanize.date(dateVal, timestamp).should.eql(timestamps[timestamp][dateVal], info);
        }
      }
    });

  });


  describe('#numberFormat', function() {
    var number = 1234567.1234567;
    var negNumber = -1234567.1234567;
    it('should default using 2 decimals, "." as decimal point, "," as thousands separator', function() {
      humanize.numberFormat(number).should.equal('1,234,567.12');
    });

    it('should be able to deal with different number of decimals properly + rounding', function() {
      humanize.numberFormat(number, 0).should.equal('1,234,567');
      humanize.numberFormat(number, 3).should.equal('1,234,567.123');
      humanize.numberFormat(number, 4).should.equal('1,234,567.1235');
      humanize.numberFormat(number, 5).should.equal('1,234,567.12346');
      humanize.numberFormat(number, 6).should.equal('1,234,567.123457');
      humanize.numberFormat(number, 7).should.equal('1,234,567.1234567');
      humanize.numberFormat(number, 8).should.equal('1,234,567.12345670');
      humanize.numberFormat(number, 9).should.equal('1,234,567.123456700');

      humanize.numberFormat(negNumber, 0).should.equal('-1,234,567');
      humanize.numberFormat(negNumber, 3).should.equal('-1,234,567.123');
      humanize.numberFormat(negNumber, 4).should.equal('-1,234,567.1235');
      humanize.numberFormat(negNumber, 5).should.equal('-1,234,567.12346');
      humanize.numberFormat(negNumber, 6).should.equal('-1,234,567.123457');
      humanize.numberFormat(negNumber, 7).should.equal('-1,234,567.1234567');
      humanize.numberFormat(negNumber, 8).should.equal('-1,234,567.12345670');
      humanize.numberFormat(negNumber, 9).should.equal('-1,234,567.123456700');
    });

    it('should be able to deal with negative decimals as if they were positive', function() {
      humanize.numberFormat(number, -3).should.equal(humanize.numberFormat(number, 3));
    });

    it('should be able to change the decimal point to a different string', function() {
      humanize.numberFormat(number, 3, 'P').should.equal('1,234,567P123');
      humanize.numberFormat(number, 3, ',').should.equal('1,234,567,123');
      humanize.numberFormat(number, 3, 'what?').should.equal('1,234,567what?123');
    });

    it('should be able to change the thousands separator to a different string', function() {
      humanize.numberFormat(number, 3, '.', '.').should.equal('1.234.567.123');
      humanize.numberFormat(number, 3, ',', '.').should.equal('1.234.567,123');
      humanize.numberFormat(number, 3, '.', 'huh?').should.equal('1huh?234huh?567.123');
    });
  });

  describe('#naturalDay', function() {
    var d = new Date();
    var today = (new Date(d.getFullYear(), d.getMonth(), d.getDate())).getTime() / 1000;

    it('should return today when using today', function() {
      humanize.naturalDay(today).should.equal('today');
      humanize.naturalDay(today + 43200).should.equal('today');
      humanize.naturalDay(today + 86399).should.equal('today');
    });

    it('should return yesterday when using yesterday', function() {
      humanize.naturalDay(today - 1).should.equal('yesterday');
      humanize.naturalDay(today - 43200).should.equal('yesterday');
      humanize.naturalDay(today - 86400).should.equal('yesterday');
    });

    it('should return tomorrow when using tomorrow', function() {
      humanize.naturalDay(today + 86400).should.equal('tomorrow');
      humanize.naturalDay(today + 86400 + 43200).should.equal('tomorrow');
      humanize.naturalDay(today + 86400 + 86399).should.equal('tomorrow');
    });

    it('should return date when before yesterday with default formatting', function() {
      humanize.naturalDay(today - 86401).should.equal(humanize.date('Y-m-d', today - 86401));
      humanize.naturalDay(today - 86411).should.equal(humanize.date('Y-m-d', today - 86411));
      humanize.naturalDay(today - (2 * 86401)).should.equal(humanize.date('Y-m-d', today - (2 * 86401)));
    });

    it('should return date when before yesterday with custom formatting', function() {
      humanize.naturalDay(today - 86401, 'h:i:s').should.equal(humanize.date('h:i:s', today - 86401));
      humanize.naturalDay(today - 86401, 'l F j, Y h:i:s').should.equal(humanize.date('l F j, Y h:i:s', today - 86401));
    });

    it('should return date when after tomorrow', function() {
      humanize.naturalDay(today + 86400 + 86401).should.equal(humanize.date('Y-m-d', today + 86400 + 86401));
      humanize.naturalDay(today + 86400 + 86411).should.equal(humanize.date('Y-m-d', today + 86400 + 86411));
      humanize.naturalDay(today + (2 * 86401)).should.equal(humanize.date('Y-m-d', today + (2 * 86401)));
    });

    it('should return date when before tomorrow with custom formatting', function() {
      humanize.naturalDay(today + 86400 + 86401, 'h:i:s').should.equal(humanize.date('h:i:s', today + 86400 + 86401));
      humanize.naturalDay(today + 86400 + 86401, 'l F j, Y h:i:s').should.equal(humanize.date('l F j, Y h:i:s', today + 86400 + 86401));
    });
  });

  describe('#relativeTime', function() {
    it('should return just now for anything within 2 seconds', function() {
      humanize.relativeTime(humanize.time() - 1).should.equal('just now');
      humanize.relativeTime(humanize.time() - .5).should.equal('just now');
      humanize.relativeTime(humanize.time()).should.equal('just now');
      humanize.relativeTime(humanize.time() + .5).should.equal('now');
      humanize.relativeTime(humanize.time() + 1).should.equal('now');
    });

    it('should return (in) X seconds (ago) for anything between 2 seconds and 59 seconds inclusive', function() {
      humanize.relativeTime(humanize.time() - 59).should.equal('59 seconds ago');
      humanize.relativeTime(humanize.time() - 37).should.equal('37 seconds ago');
      humanize.relativeTime(humanize.time() - 37.3).should.equal('37 seconds ago');
      humanize.relativeTime(humanize.time() - 2).should.equal('2 seconds ago');
      humanize.relativeTime(humanize.time() + 2).should.equal('in 2 seconds');
      humanize.relativeTime(humanize.time() + 22).should.equal('in 22 seconds');
      humanize.relativeTime(humanize.time() + 22.7).should.equal('in 22 seconds');
      humanize.relativeTime(humanize.time() + 59).should.equal('in 59 seconds');
    });

    it('should return (in) about a minute (ago) for anything between 1 minute (inclusive) and 2 minutes (exclusive)', function() {
      humanize.relativeTime(humanize.time() - 119).should.equal('about a minute ago');
      humanize.relativeTime(humanize.time() - 73).should.equal('about a minute ago');
      humanize.relativeTime(humanize.time() - 60).should.equal('about a minute ago');
      humanize.relativeTime(humanize.time() + 60).should.equal('in about a minute');
      humanize.relativeTime(humanize.time() + 90).should.equal('in about a minute');
      humanize.relativeTime(humanize.time() + 119).should.equal('in about a minute');
    });

    it('should return (in) X minutes (ago) for anything between 2 minutes (inclusive) and 60 minutes (exclusive)', function() {
      humanize.relativeTime(humanize.time() - 59*60 - 59).should.equal('59 minutes ago');
      humanize.relativeTime(humanize.time() - 59*60 - 10).should.equal('59 minutes ago');
      humanize.relativeTime(humanize.time() - 33*60 - 17).should.equal('33 minutes ago');
      humanize.relativeTime(humanize.time() - 33*60 - 35).should.equal('33 minutes ago');
      humanize.relativeTime(humanize.time() - 120).should.equal('2 minutes ago');
      humanize.relativeTime(humanize.time() + 120).should.equal('in 2 minutes');
      humanize.relativeTime(humanize.time() + 24*60 + 17).should.equal('in 24 minutes');
      humanize.relativeTime(humanize.time() + 47*60 + 35).should.equal('in 47 minutes');
      humanize.relativeTime(humanize.time() + 59*60 + 16).should.equal('in 59 minutes');
      humanize.relativeTime(humanize.time() + 59*60 + 59).should.equal('in 59 minutes');
    });

    it('should return (in) about an hour (ago) for anything between 1 hour (inclusive) and 2 hours (exclusive)', function() {
      humanize.relativeTime(humanize.time() - 7199).should.equal('about an hour ago');
      humanize.relativeTime(humanize.time() - 3601).should.equal('about an hour ago');
      humanize.relativeTime(humanize.time() - 3600).should.equal('about an hour ago');
      humanize.relativeTime(humanize.time() + 3600).should.equal('in about an hour');
      humanize.relativeTime(humanize.time() + 5974).should.equal('in about an hour');
      humanize.relativeTime(humanize.time() + 7199).should.equal('in about an hour');
    });

    it('should return (in) X hours (ago) for anything between 2 hours (inclusive) and 24 hours (exclusive)', function() {
      humanize.relativeTime(humanize.time() - 86399).should.equal('23 hours ago');
      humanize.relativeTime(humanize.time() - (3*3600 + 56)).should.equal('3 hours ago');
      humanize.relativeTime(humanize.time() - (15*3600 + 3599)).should.equal('15 hours ago');
      humanize.relativeTime(humanize.time() - 7200).should.equal('2 hours ago');
      humanize.relativeTime(humanize.time() + 7200).should.equal('in 2 hours');
      humanize.relativeTime(humanize.time() + (10*3600 + 997)).should.equal('in 10 hours');
      humanize.relativeTime(humanize.time() + (15*3600 + 3599)).should.equal('in 15 hours');
      humanize.relativeTime(humanize.time() + 86399).should.equal('in 23 hours');
    });

    it('should return (in) X day(s) (ago) for anything between 1 day (inclusive) and 29 days (exclusive)', function() {
      humanize.relativeTime(humanize.time() - (29*86400 - 1)).should.equal('28 days ago');
      humanize.relativeTime(humanize.time() - (2*86400)).should.equal('2 days ago');
      humanize.relativeTime(humanize.time() - (2*86400 - 1)).should.equal('1 day ago');
      humanize.relativeTime(humanize.time() - 86400).should.equal('1 day ago');
      humanize.relativeTime(humanize.time() + 86400).should.equal('in 1 day');
      humanize.relativeTime(humanize.time() + (2*86400)).should.equal('in 2 days');
      humanize.relativeTime(humanize.time() + (29*86400 - 1)).should.equal('in 28 days');
    });

    it('should return (in) about a month (ago) for anything between 28 days (inclusive) to 60 days (exclusive)', function() {
      humanize.relativeTime(humanize.time() - (60*86400 - 1)).should.equal('about a month ago');
      humanize.relativeTime(humanize.time() - (29*86400)).should.equal('about a month ago');
      humanize.relativeTime(humanize.time() + (29*86400)).should.equal('in about a month');
      humanize.relativeTime(humanize.time() + (60*86400 - 1)).should.equal('in about a month');
    });

    it('should return (in) X months (ago) using month arithmetic', function() {
      humanize.relativeTime(humanize.time() - (60*86400)).should.equal('2 months ago');
      humanize.relativeTime(humanize.time() + (60*86400)).should.equal('in 2 months');

      var d = new Date();
      var monthsAgo4 = (new Date(d.getFullYear(), d.getMonth() - 4, d.getDate())).getTime() / 1000;
      humanize.relativeTime(monthsAgo4).should.equal('4 months ago');

      var monthsFuture4 = (new Date(d.getFullYear(), d.getMonth() + 4, d.getDate())).getTime() / 1000;
      humanize.relativeTime(monthsFuture4).should.equal('in 4 months');

      var monthsAgo11 = (new Date(d.getFullYear(), d.getMonth() - 11, d.getDate())).getTime() / 1000;
      humanize.relativeTime(monthsAgo11).should.equal('11 months ago');

      var monthsFuture11 = (new Date(d.getFullYear(), d.getMonth() + 11, d.getDate())).getTime() / 1000;
      humanize.relativeTime(monthsFuture11).should.equal('in 11 months');
    });

    it('should return (in) X year(s) (ago) for anything over a year via year arithmetic', function() {
      var d = new Date();
      var yearsAgo1 = (new Date(d.getFullYear() - 1, d.getMonth(), d.getDate())).getTime() / 1000;
      humanize.relativeTime(yearsAgo1).should.equal('a year ago');

      var yearsFuture1 = (new Date(d.getFullYear() + 1, d.getMonth(), d.getDate())).getTime() / 1000;
      humanize.relativeTime(yearsFuture1).should.equal('in a year');

      var june1 = (new Date(d.getFullYear(), 5, 1));

      var yearsAgo2 = (new Date(june1.getFullYear() - 2, june1.getMonth() + 6, june1.getDate() + 19)).getTime() / 1000;
      humanize.relativeTime(yearsAgo2).should.equal('2 years ago');

      var wrapToYearsAgo1 = (new Date(june1.getFullYear() - 2, june1.getMonth() + 7, june1.getDate() + 19)).getTime() / 1000;
      humanize.relativeTime(wrapToYearsAgo1).should.equal('a year ago');

      var yearsFuture2 = (new Date(june1.getFullYear() + 2, june1.getMonth() + 6, june1.getDate() + 19)).getTime() / 1000;
      humanize.relativeTime(yearsFuture2).should.equal('in 2 years');

      var wrapToYearsFuture1 = (new Date(june1.getFullYear() + 2, june1.getMonth() - 7, june1.getDate() + 19)).getTime() / 1000;
      humanize.relativeTime(wrapToYearsFuture1).should.equal('in a year');

    });

  });

  describe('#ordinal', function() {
    it('should be able to return the correct ordinal string', function() {
      var tests = {
        0: '0th',
        1: '1st',
        2: '2nd',
        3: '3rd',
        4: '4th',
        5: '5th',
        11: '11th',
        12: '12th',
        13: '13th',
        21: '21st',
        31: '31st',
        32: '32nd',
        43: '43rd',
        '87 Street': '87th',
        '223 APT 23': '223rd',
        'APT': '0th',
        '-1': '-1st',
        '-2': '-2nd',
        '-3': '-3rd',
        112: '112th'
      };

      for (var num in tests) {
        humanize.ordinal(num).should.equal(tests[num]);
      }
    });
  });


  describe('#filesize', function() {
    it('should be able to use the defaults properly', function() {
      humanize.filesize(12).should.equal('12 bytes');
      humanize.filesize(1021).should.equal('1,021 bytes');
      humanize.filesize(1024).should.equal('1.00 KB');

      humanize.filesize(Math.pow(1024, 2)).should.equal('1.00 MB');
      humanize.filesize(Math.pow(1024, 3)).should.equal('1.00 GB');
      humanize.filesize(Math.pow(1024, 4)).should.equal('1.00 TB');
      humanize.filesize(Math.pow(1024, 5)).should.equal('1.00 PB');
      humanize.filesize(Math.pow(1024, 6)).should.equal('1,024.00 PB');
      humanize.filesize(1234567890).should.equal('1.15 GB');
    });

    it('should be able to change kilo to a different value', function() {
      humanize.filesize(12, 1000).should.equal('12 bytes');
      humanize.filesize(1021, 1000).should.equal('1.02 KB');
      humanize.filesize(1024, 1000).should.equal('1.02 KB');
      humanize.filesize(Math.pow(1024, 2), 1000).should.equal('1.05 MB');
      humanize.filesize(Math.pow(1024, 3), 1000).should.equal('1.07 GB');
      humanize.filesize(Math.pow(1024, 4), 1000).should.equal('1.10 TB');
      humanize.filesize(Math.pow(1024, 5), 1000).should.equal('1.13 PB');
      humanize.filesize(Math.pow(1024, 6), 1000).should.equal('1,152.92 PB');
      humanize.filesize(1234567890, 1000).should.equal('1.23 GB');
    });
  });


  describe('#intword', function() {
    it('should be able to use the defaults properly', function() {
      humanize.intword(12).should.equal('12.00');
      humanize.intword(999).should.equal('999.00');
      humanize.intword(1001).should.equal('1.00K');

      humanize.intword(Math.pow(1000, 2)).should.equal('1.00M');
      humanize.intword(Math.pow(1000, 3)).should.equal('1.00B');
      humanize.intword(Math.pow(1000, 4)).should.equal('1.00T');
      humanize.intword(1234567890).should.equal('1.23B');
    });

    it('should be able to change units or kilo to a different value', function() {
      var units = ['ones', 'thousands', 'millions', 'billions', 'trillions'];
      humanize.intword(12, units, 1000, 0, '.', ',', ' ').should.equal('12 ones');
      humanize.intword(999, units, 1000, 0, '.', ',', ' ').should.equal('999 ones');
      humanize.intword(1024, units, 1000, 0, '.', ',', ' ').should.equal('1 thousands');
      humanize.intword(Math.pow(1000, 2), units, 1000, 0, '.', ',', ' ').should.equal('1 millions');
      humanize.intword(Math.pow(1000, 3), units, 1000, 0, '.', ',', ' ').should.equal('1 billions');
      humanize.intword(Math.pow(1000, 4), units, 1000, 0, '.', ',', ' ').should.equal('1 trillions');
      humanize.intword(1234567890, units, 1000, 0, '.', ',', ' ').should.equal('1 billions');
    });
  });


  describe('#linebreaks', function() {
    it('should wrap the string with <p> tags', function() {
      humanize.linebreaks('').should.equal('<p></p>');
    });

    it('should remove new lines at beginning and end', function() {
      humanize.linebreaks("Foo\n\nBar\n\n\n").should.equal('<p>Foo</p><p>Bar</p>');
      humanize.linebreaks("\n\r\n\rFoo\n\nBar").should.equal('<p>Foo</p><p>Bar</p>');
    });

    it('should change all new lines into <br> tags', function() {
      humanize.linebreaks("Foo\nBar").should.equal('<p>Foo<br />Bar</p>');
      humanize.linebreaks("Foo\nBar\r\nBlah").should.equal('<p>Foo<br />Bar<br />Blah</p>');
    });

    it('should change all multi-new lines into <p> tags', function() {
      humanize.linebreaks("Foo\n\nBar").should.equal('<p>Foo</p><p>Bar</p>');
      humanize.linebreaks("Foo\n\n\nBar").should.equal('<p>Foo</p><p>Bar</p>');
      humanize.linebreaks("Foo\n\n\r\nBar").should.equal('<p>Foo</p><p>Bar</p>');
      humanize.linebreaks("Foo\n\n\r\n\rBar").should.equal('<p>Foo</p><p>Bar</p>');
    });
  });

  describe('#nl2br', function() {
    it('should change any type of new line into a <br />', function() {
      humanize.nl2br('').should.equal('');
      humanize.nl2br("\n").should.equal('<br />');
      humanize.nl2br("\r").should.equal('<br />');
      humanize.nl2br("\r\n").should.equal('<br />');
      humanize.nl2br("Foo\nBar").should.equal('Foo<br />Bar');
      humanize.nl2br("\r\nFoo\nBar\n").should.equal('<br />Foo<br />Bar<br />');
      humanize.nl2br("\r\r\n\nFoo\nBar\n\n\r\n\r").should.equal('<br /><br /><br />Foo<br />Bar<br /><br /><br /><br />');
    });
  });

  describe('#truncatechars', function() {
    it('should be able to truncate characters properly', function() {
      humanize.truncatechars('foobar', 0).should.equal('…');
      humanize.truncatechars('foobar', 1).should.equal('f…');
      humanize.truncatechars('foobar', 2).should.equal('fo…');
      humanize.truncatechars('foobar', 3).should.equal('foo…');
      humanize.truncatechars('foobar', 4).should.equal('foob…');
    });
  });

  describe('#truncatewords', function() {
    it('should be able to truncate words properly', function() {
      humanize.truncatewords('a b c d e', 0).should.equal('…');
      humanize.truncatewords('a b c d e', 1).should.equal('a…');
      humanize.truncatewords('a b c d e', 2).should.equal('a b…');
      humanize.truncatewords('a b c d e', 3).should.equal('a b c…');
      humanize.truncatewords('a b c d e', 4).should.equal('a b c d…');
    });
  });



});
