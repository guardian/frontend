package tools

import org.fluentlenium.core.domain.{FluentWebElement, FluentList}
import org.openqa.selenium.interactions.Actions
import play.api.test.TestBrowser
import collection.JavaConverters._
import org.scalatest.Matchers

trait MatchListFeatureTools extends Matchers {
  protected def assertTeamWithScore(matches: FluentList[FluentWebElement], team: String, score: String): Unit = {
    val matchesStr = matches.asScala.map(matchEl =>
      matchEl.find(".football-team__name").text + " - " + matchEl.find(".football-team__score").text,
    )
    assert(
      matches.asScala.exists { matchEl =>
        matchEl.find(".football-team__name").text == team && matchEl.find(".football-team__score").text == score
      },
      s"$matchesStr did not contain $team - $score",
    )
  }
  protected def assertNotTeamWithScore(matches: FluentList[FluentWebElement], team: String, score: String): Unit = {
    val matchesStr = matches.asScala.map(matchEl =>
      matchEl.find(".football-team__name").text + " - " + matchEl.find(".football-team__score").text,
    )
    assert(
      !matches.asScala.exists { matchEl =>
        matchEl.find(".football-team__name").text == team && matchEl.find(".football-team__score").text == score
      },
      s"$matchesStr erroneously contained $team - $score",
    )
  }

  protected def assertFixture(matches: FluentList[FluentWebElement], team1: String, team2: String): Unit = {
    val matchesStr = matches.asScala.map(matchEl => matchEl.find(".football-team__name").texts)
    assert(
      matches.asScala.exists { matchEl =>
        val texts = matchEl.find(".football-team__name").texts
        texts.size should equal(2)
        texts.contains(team1) && texts.contains(team2)
      },
      s"$matchesStr did not contain $team1 v $team2",
    )
  }
  protected def assertNotFixture(matches: FluentList[FluentWebElement], team1: String, team2: String): Unit = {
    val matchesStr = matches.asScala.map(matchEl => matchEl.find(".football-team__name").texts)
    assert(
      !matches.asScala.exists { matchEl =>
        val texts = matchEl.find(".football-team__name").texts
        texts.size should equal(2)
        texts.contains(team1) && texts.contains(team2)
      },
      s"$matchesStr did erroneously contained $team1 v $team2",
    )
  }
  protected def scrollToElementAndClick(selector: String, browser: TestBrowser): Unit = {
    val element = browser.$(selector).first
    val builder = new Actions(browser.webDriver)

    builder.moveToElement(element.getElement)
    builder.click()
    builder.build().perform()
  }
}
