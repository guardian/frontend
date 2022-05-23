package common

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatestplus.play.guice.GuiceOneAppPerSuite

class RelativePathEscaperTest extends AnyFlatSpec with Matchers with GuiceOneAppPerSuite {
  "RelativePathEscaper" should "escape javascript paths in Static.js.curl" in {
    val curlJs = common.Assets.js.curl
    val escapedCurlJs = RelativePathEscaper.escapeLeadingDotPaths(curlJs)
    escapedCurlJs should include("[\"..\" + \"/\" + \"domReady\"]")
  }
  it should "escape path-like json in football config references data" in {
    val jsonFootballRefs =
      "\"references\":[{\"paFootballTeam\":\"13\"},{\"esaFootballTeam\":\"/football/team/32\"},{\"paFootballCompetition\":\"101\"},{\"esaFootballTeam\":\"/football/team/9\"},{\"optaFootballTournament\":\"10/2012\"},{\"paFootballTeam\":\"28\"},{\"optaFootballTeam\":\"2\"},{\"esaFootballTournament\":\"/football/tournament/div1\"},{\"optaFootballTeam\":\"103\"}]"
    val escapedJson = RelativePathEscaper.escapeLeadingSlashFootballPaths(jsonFootballRefs)
    escapedJson should not include """":"/football/team/32""""
    escapedJson should include(""":"/" + "football/" + "team/" + "32"""")
    escapedJson should not include """":"/football/tournament/div1""""
    escapedJson should include(""":"/" + "football/" + "tournament/" + "div1"""")
  }
}
