package tools

import org.fluentlenium.core.domain.{FluentList, FluentWebElement}
import org.openqa.selenium.interactions.Actions
import play.api.test.TestBrowser

import collection.JavaConverters._
import org.scalatest.matchers.should.Matchers

trait MatchListFeatureTools extends Matchers {

  private def getTeamName(matchEl: FluentWebElement): String =
    matchEl.find(".football-team__name").first().text().trim

  private def getTeamScore(matchEl: FluentWebElement): String =
    matchEl.find(".football-team__score").first().text().trim

  protected def assertTeamWithScore(matches: FluentList[FluentWebElement], team: String, score: String): Unit = {
    assert(
      matches.asScala.exists { matchEl => getTeamName(matchEl) == team && getTeamScore(matchEl) == score },
    )
  }
  protected def assertNotTeamWithScore(matches: FluentList[FluentWebElement], team: String, score: String): Unit = {
    assert(
      !matches.asScala.exists { matchEl => getTeamName(matchEl) == team && getTeamScore(matchEl) == score },
    )
  }

  protected def assertFixture(matches: FluentList[FluentWebElement], team1: String, team2: String): Unit = {
    assert(
      matches.asScala.exists { matchEl =>
        val texts = matchEl.find(".football-team__name").texts
        texts.size should equal(2)
        texts.contains(team1) && texts.contains(team2)
      },
    )
  }
  protected def assertNotFixture(matches: FluentList[FluentWebElement], team1: String, team2: String): Unit = {
    assert(
      !matches.asScala.exists { matchEl =>
        val texts = matchEl.find(".football-team__name").texts
        texts.size should equal(2)
        texts.contains(team1) && texts.contains(team2)
      },
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
