package test

import org.scalatest.{ FeatureSpec, GivenWhenThen }
import org.scalatest.matchers.ShouldMatchers
import collection.JavaConversions._

class TagFeatureTest extends FeatureSpec with GivenWhenThen with ShouldMatchers {

  feature("Tag Pages trail size") {

    scenario("Tag pages should show 20 trails") {

      Given("I visit a tag page")

      HtmlUnit("/technology/askjack") { browser =>
        import browser._
        val trails = $(".trailblock .unstyled > li")
        trails.length should be(20)
      }

    }

  }

  feature("Tag Pages Football Nav") {

    scenario("Tags that are football compeitions that have teams, link to that place on the teams page") {

      Given("I visit the 'Premier League' tag page")

      HtmlUnit("/football/premierleague") { browser =>
        import browser._
        val teamsPageLink = findFirst("ul.nav a[data-link-name='teams']")
        teamsPageLink.getAttribute("href") should endWith("/football/teams#premierleague")
      }

    }

    scenario("Tags that are football compeitions but don't have teams don't link to the teams page") {

      Given("I visit the 'Capital One Cup' tag page")

      HtmlUnit("/football/capital-one-cup") { browser =>
        import browser._
        val teamsPageLinks = $("ul.nav a[data-link-name='teams']")
        teamsPageLinks.length should be(0)
      }

      Given("I visit the 'Scottish League Cup' tag page")

      HtmlUnit("/football/cis-insurance-cup") { browser =>
        import browser._
        val teamsPageLinks = $("ul.nav a[data-link-name='teams']")
        teamsPageLinks.length should be(0)
      }

    }

  }

}