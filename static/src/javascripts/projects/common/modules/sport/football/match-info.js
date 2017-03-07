import $ from 'lib/$';
import ajax from 'lib/ajax';

/**
 * @param {Object} match
 * @param {string} whosCalling (url)
 */
class MatchInfo {
 constructor(match, whosCalling) {
     this.endpoint += (match.id ? match.id : [match.date].concat(match.teams).join('/')) +
         '.json?page=' + encodeURIComponent(whosCalling);
 }

 /**
  * @return Reqwest
  */
 fetch() {
     return ajax({
         crossOrigin: true,
         url: this.endpoint
     });
 }
}

/**
 * @type {string}
 */
MatchInfo.prototype.endpoint = '/football/api/match-nav/';

export default MatchInfo; // define
