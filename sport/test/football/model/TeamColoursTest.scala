package football.model

import org.scalatest.{ShouldMatchers, path}
import model.TeamColours
import pa.{Official, LineUpTeam}

class TeamColoursTest extends path.FreeSpec with ShouldMatchers {
  "home team colour" - {
    "if colour is white it should darken" in {
      TeamColours(fakeTeam("#FFFFFF"), fakeTeam("#333333")).home should equal("#EEEEEE")
    }
    "if colour is the same as away should remain the same" in {
      TeamColours(fakeTeam("#333333"), fakeTeam("#333333")).home should equal("#333333")
    }
    "if it's not white and different to away it should remain the same" in {
      TeamColours(fakeTeam("#333333"), fakeTeam("#666666")).home should equal("#333333")
    }
  }

  "away team colour" - {
    "if colour is white it should darken" in {
      TeamColours(fakeTeam("#333333"), fakeTeam("#FFFFFF")).away should equal("#EEEEEE")
    }
    "if colour is the same as home should darken 30%" ignore {
      TeamColours(fakeTeam("#666666"), fakeTeam("#666666")).away should equal("#1a1a1a")
    }
    "if colour is light colour and home is white colour should darken 30%" ignore {
      TeamColours(fakeTeam("#FFFFFF"), fakeTeam("#EEEEEE")).away should equal("#b3b3b3")
    }
    "if it's not white and different to away should remain the same" in {
      TeamColours(fakeTeam("#CCCCCC"), fakeTeam("#555555")).away should equal("#555555")
    }
  }

  "home team colour is light" - {
    "if colour is light it should be true" in {
      TeamColours(fakeTeam("#ffffff"), fakeTeam("#FFFFFF")).homeTeamIsLight should equal(true)
      TeamColours(fakeTeam("#00ccff"), fakeTeam("#FFFFFF")).homeTeamIsLight should equal(true)
    }
    "if colour is dark it should be false" in {
      TeamColours(fakeTeam("#000000"), fakeTeam("#FFFFFF")).homeTeamIsLight should equal(false)
      TeamColours(fakeTeam("#ff00ff"), fakeTeam("#FFFFFF")).homeTeamIsLight should equal(false)
    }
  }

  "away team colour is light" - {
    "if colour is light it should be true" in {
      TeamColours(fakeTeam("#FFFFFF"), fakeTeam("#FFFFFF")).awayTeamIsLight should equal(true)
      TeamColours(fakeTeam("#FFFFFF"), fakeTeam("#00ccff")).awayTeamIsLight should equal(true)
    }
    "if colour is dark it should be false" in {
      TeamColours(fakeTeam("#FFFFFF"), fakeTeam("#000000")).awayTeamIsLight should equal(false)
      TeamColours(fakeTeam("#FFFFFF"), fakeTeam("#ff00ff")).awayTeamIsLight should equal(false)
    }
  }


  private def fakeTeam(colour: String): LineUpTeam =
    LineUpTeam("", "", colour, Official("", ""), "", 0, 0, 0, 0, 0, 0, 0, Seq.empty)

}


