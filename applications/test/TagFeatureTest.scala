package test

import org.scalatest.{DoNotDiscover, FeatureSpec, GivenWhenThen, Matchers}
import collection.JavaConversions._
import conf.Switches
import org.fluentlenium.core.domain.{FluentWebElement, FluentList}

@DoNotDiscover class TagFeatureTest extends FeatureSpec with GivenWhenThen with Matchers with ConfiguredTestSuite {

  feature("Tag Pages trail size") {

    scenario("Tag pages should show at least 20 trails (includes  leadContent if present)") {

      Given("I visit a tag page")

      goTo("/politics/labour") { browser =>
        val trails = browser.$(".fc-item__container")
        trails.length should be(20)
      }
    }
  }

  feature("Tag Series, Blogs and Contributors Pages trail size") {

    scenario("Tag Series, Blogs and Contributors pages should show at least 19 trails (includes leadContent if present)") {

      Given("I visit a tag page")

      goTo("/technology/askjack") { browser =>
        val trails = browser.$(".fc-item__container")
        trails.length should be(19)
      }
    }
  }

  feature("Contributor pages") {

    scenario("Should display the profile images") {

      Given("I visit the 'Jemima Kiss' contributor page")
      Switches.ImageServerSwitch.switchOn()

      goTo("/profile/jemimakiss") { browser =>
        Then("I should see her profile image")
        val profileImage = browser.findFirst(".profile__img img")
        profileImage.getAttribute("src") should endWith(s"42593747/Jemima-Kiss.jpg")
      }
    }

    scenario("Should not not display profiles where they don't exist") {

      Given("I visit the 'Sam Jones' contributor page")
      goTo("/profile/samjones") { browser =>
        Then("I should not see her profile image")
        val profileImages = browser.find(".profile__img img")
        profileImages.length should be(0)
      }

    }
  }

  feature("Tag Pages Football Nav") {

    scenario("Tags that are football competitions that have teams, link to that place on the teams page") {

      Given("I visit the 'Premier League' tag page")

      goTo("/football/premierleague") { browser =>
        val teamsPageLink = browser.findFirst("ul.nav a[data-link-name='teams']")
        teamsPageLink.getAttribute("href") should endWith("/football/teams#premierleague")
      }
    }

    scenario("Tags that are football compeitions but don't have teams don't link to the teams page") {

      Given("I visit the 'Capital One Cup' tag page")

      goTo("/football/capital-one-cup") { browser =>
        val teamsPageLinks = browser.$("ul.nav a[data-link-name='teams']")
        teamsPageLinks.length should be(0)
      }

      Given("I visit the 'Scottish League Cup' tag page")

      goTo("/football/cis-insurance-cup") { browser =>
        val teamsPageLinks = browser.$("ul.nav a[data-link-name='teams']")
        teamsPageLinks.length should be(0)
      }

    }

    scenario("Pagination") {

      Given("I visit the 'Cycling' tag page")

      goTo("/sport/cycling") { browser =>
        import browser._

        val linksOnFirstPage = findFirst(".container__body").find("a").map(_.getAttribute("href"))
        linksOnFirstPage.size should be > 10
        findByRel($("link"), "next").head.getAttribute("href") should endWith ("/sport/cycling?page=2")
        findByRel($("link"), "prev") should be (None)

        Then("I should be able to navigate to the 'next' page")
        findFirst(".pagination").findFirst("[rel=next]").click()
        val linksOnNextPage = findFirst(".container__body").find("a").map(_.getAttribute("href"))
        linksOnNextPage.size should be > 10

        findByRel($("link"), "next").head.getAttribute("href") should endWith ("/sport/cycling?page=3")
        findByRel($("link"), "prev").head.getAttribute("href") should endWith ("/sport/cycling")

        linksOnNextPage.foreach( linksOnFirstPage should not contain _ )

        And("The title should reflect the page number")
        findFirst("title").getText should include ("| Page 2 of")

        And("I should be able to navigate to the 'previous' page")
        findFirst(".pagination").findFirst("[rel=prev]").click()
        val linksOnPreviousPage = findFirst(".container__body").find("a").map(_.getAttribute("href"))
        linksOnPreviousPage should equal (linksOnFirstPage)
      }
    }
  }

  //I'm not having a happy time with the selectors on links...
  private def findByRel(elements: FluentList[FluentWebElement], rel: String) = elements.toSeq.find(_.getAttribute("rel") == rel)
}
