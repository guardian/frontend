package football.model

import org.scalatest.{DoNotDiscover, FreeSpec, Matchers}
import model.TeamColours
import pa.{Official, LineUpTeam}
import test.ConfiguredTestSuite

@DoNotDiscover class TeamColoursTest extends FreeSpec with Matchers with ConfiguredTestSuite {
  "home team colour" - {
    "should be left as-is if it is the same as the away team" in {
      TeamColours(fakeTeam("#333333"), fakeTeam("#333333")).home should equal("#333333")
    }
    "should be left as-is when different to the away team's colour" in {
      TeamColours(fakeTeam("#333333"), fakeTeam("#666666")).home should equal("#333333")
    }
    "ignores case" in {
      TeamColours(fakeTeam("#abCdEf"), fakeTeam("#333333")).home should equal("#abcdef")
    }
  }

  "away team colour" - {
    "should be darkened 30% if it is the same as the home colour" in {
      TeamColours(fakeTeam("#666666"), fakeTeam("#666666")).away should equal("#474747")
    }
    "should stay the same if it different to the home team's colour" in {
      TeamColours(fakeTeam("#CCCCCC"), fakeTeam("#555555")).away should equal("#555555")
    }
    "ignores case" in {
      TeamColours(fakeTeam("#333333"), fakeTeam("#abCDef")).away should equal("#abcdef")
    }
    "should be darkened 30% if both teams were white" in {
      TeamColours(fakeTeam("#FFFFFF"), fakeTeam("#FFFFFF")).away should equal("#b3b3b3")
    }
  }

  "home team colour is light" - {
    "is true for a light colour" in {
      TeamColours(fakeTeam("#ffffff"), fakeTeam("#FFFFFF")).homeTeamIsLight should equal(true)
      TeamColours(fakeTeam("#00ccff"), fakeTeam("#FFFFFF")).homeTeamIsLight should equal(true)
    }
    "is false for a dark colour" in {
      TeamColours(fakeTeam("#000000"), fakeTeam("#FFFFFF")).homeTeamIsLight should equal(false)
      TeamColours(fakeTeam("#ff00ff"), fakeTeam("#FFFFFF")).homeTeamIsLight should equal(false)
    }
  }

  "away team colour is light" - {
    "is true for a light colour" in {
      TeamColours(fakeTeam("#eeeeee"), fakeTeam("#dddddd")).awayTeamIsLight should equal(true)
      TeamColours(fakeTeam("#eeeeee"), fakeTeam("#00ccff")).awayTeamIsLight should equal(true)
    }
    "is false for a dark colour" in {
      TeamColours(fakeTeam("#eeeeee"), fakeTeam("#000000")).awayTeamIsLight should equal(false)
      TeamColours(fakeTeam("#eeeeee"), fakeTeam("#ff00ff")).awayTeamIsLight should equal(false)
    }
    "is false for a light colour that gets darkened to a dark one" in {
      TeamColours(fakeTeam("#00ccff"), fakeTeam("#00ccff")).awayTeamIsLight should equal(false)
    }
  }


  private def fakeTeam(colour: String): LineUpTeam =
    LineUpTeam("", "", colour, Official("", ""), "", 0, 0, 0, 0, 0, 0, 0, Seq.empty)

}


