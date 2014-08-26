package common

import conf.Static
import org.scalatest.{Matchers, FlatSpec}
import test.Fake
import conf.Switches.SeoEscapeFootballJsonPathLikeValuesSwitch

class RelativePathEscaperTest extends FlatSpec with Matchers {
  "RelativePathEscaper" should "escape javascript paths in Static.js.curl" in Fake{
    val curlJs = Static.js.curl
    val escapedCurlJs = RelativePathEscaper.escapeLeadingDotPaths(curlJs)
    escapedCurlJs should include ("[\"..\" + \"/\" + \"domReady\"]")
  }
  it should "escape path-like json in football config references data when enabled" in Fake {
    val jsonFootballRefs = "\"references\":[{\"paFootballTeam\":\"13\"},{\"esaFootballTeam\":\"/football/team/32\"},{\"paFootballCompetition\":\"101\"},{\"esaFootballTeam\":\"/football/team/9\"},{\"optaFootballTournament\":\"10/2012\"},{\"paFootballTeam\":\"28\"},{\"optaFootballTeam\":\"2\"},{\"esaFootballTournament\":\"/football/tournament/div1\"},{\"optaFootballTeam\":\"103\"}]"
    SeoEscapeFootballJsonPathLikeValuesSwitch.switchOn()
    val escapedJson = RelativePathEscaper.escapeLeadingSlashFootballPaths(jsonFootballRefs)
    escapedJson should not include ("""":"/football/team/32"""")
    escapedJson should include (""":"/" + "football/" + "team/" + "32"""")
    escapedJson should not include ("""":"/football/tournament/div1"""")
    escapedJson should include (""":"/" + "football/" + "tournament/" + "div1"""")
  }
  it should "NOT escape path-like json in football config references data when DISABLED" in Fake {
    val jsonFootballRefs = "\"references\":[{\"paFootballTeam\":\"13\"},{\"esaFootballTeam\":\"/football/team/32\"},{\"paFootballCompetition\":\"101\"},{\"esaFootballTeam\":\"/football/team/9\"},{\"optaFootballTournament\":\"10/2012\"},{\"paFootballTeam\":\"28\"},{\"optaFootballTeam\":\"2\"},{\"esaFootballTournament\":\"/football/tournament/div1\"},{\"optaFootballTeam\":\"103\"}]"
    SeoEscapeFootballJsonPathLikeValuesSwitch.switchOff()
    val escapedJson = RelativePathEscaper.escapeLeadingSlashFootballPaths(jsonFootballRefs)
    escapedJson should include ("""":"/football/team/32"""")
    escapedJson should not include (""":"/" + "football/" + "team/" + "32"""")
    escapedJson should include ("""":"/football/tournament/div1"""")
    escapedJson should not include (""":"/" + "football/" + "tournament/" + "div1"""")
  }
}
