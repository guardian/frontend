package tools

import org.fluentlenium.core.domain.{FluentWebElement, FluentList}
import org.openqa.selenium.interactions.Actions
import play.api.test.TestBrowser
import collection.JavaConversions._
import org.scalatest.ShouldMatchers

trait MatchListFeatureTools extends ShouldMatchers {
  protected def assertTeamWithScore(matches: FluentList[FluentWebElement], team: String, score: String): Unit = {
    val matchesStr = matches.map(matchEl => matchEl.find(".football-team__name").getText + " - " + matchEl.find(".football-team__score").getText)
    assert(
      matches.exists { matchEl =>
        matchEl.find(".football-team__name").getText == team && matchEl.find(".football-team__score").getText == score
      },
      s"$matchesStr did not contain $team - $score"
    )
  }
  protected def assertNotTeamWithScore(matches: FluentList[FluentWebElement], team: String, score: String): Unit = {
    val matchesStr = matches.map(matchEl => matchEl.find(".football-team__name").getText + " - " + matchEl.find(".football-team__score").getText)
    assert(
      !matches.exists { matchEl =>
        matchEl.find(".football-team__name").getText == team && matchEl.find(".football-team__score").getText == score
      },
      s"$matchesStr erroneously contained $team - $score"
    )
  }

  protected def assertFixture(matches: FluentList[FluentWebElement], team1: String, team2: String): Unit = {
    val matchesStr = matches.map(matchEl => matchEl.find(".football-team__name").getTexts)
    assert(
      matches.exists { matchEl =>
        val texts = matchEl.find(".football-team__name").getTexts
        texts.size should equal(2)
        texts.contains(team1) && texts.contains(team2)
      },
      s"$matchesStr did not contain $team1 v $team2"
    )
  }
  protected def assertNotFixture(matches: FluentList[FluentWebElement], team1: String, team2: String): Unit = {
    val matchesStr = matches.map(matchEl => matchEl.find(".football-team__name").getTexts)
    assert(
      !matches.exists { matchEl =>
        val texts = matchEl.find(".football-team__name").getTexts
        texts.size should equal(2)
        texts.contains(team1) && texts.contains(team2)
      },
      s"$matchesStr did erroneously contained $team1 v $team2"
    )
  }
  protected def scrollToElementAndClick(selector: String, browser: TestBrowser): Unit = {
    val element = browser.findFirst(selector)
    val builder = new Actions(browser.webDriver)

    builder.moveToElement(element.getElement)
    builder.click()
    builder.build().perform()
  }
}
