package test

import org.scalatest.{ FeatureSpec, GivenWhenThen }
import org.scalatest.matchers.ShouldMatchers
import collection.JavaConversions._
import conf.{Switches, Configuration}

class TagFeatureTest extends FeatureSpec with GivenWhenThen with ShouldMatchers {

  feature("Tag Pages trail size") {

    scenario("Tag pages should show at least 20 trails (includes  leadContent if present)") {

      Given("I visit a tag page")

      HtmlUnit("/technology/askjack") { browser =>
        import browser._
        val trails = $(".items .item")
        trails.length should be(20)
      }

    }

  }
  
  feature("Contributor pages") {

    scenario("Should display the profile images") {

      Given("I visit the 'Jemima Kiss' contributor page")
      Switches.ImageServerSwitch.switchOn()

      HtmlUnit("/profile/jemimakiss") { browser =>
        import browser._
        Then("I should see her profile image")
        val profileImage = findFirst(".profile-img img")
        profileImage.getAttribute("src") should be(s"${Configuration.images.path}/c/sys-images/Guardian/Pix/contributor/2007/09/28/jemima_kiss_140x140.jpg")
      }
    }

    scenario("Should not not display profiles where they don't exist") {
      Given("I visit the 'Sam Jones' contributor page")
      HtmlUnit("/profile/samjones") { browser =>
        import browser._
        Then("I should not see her profile image")
        val profileImages = find(".profile-img img")
        profileImages.length should be(0) 
      }

    }
  }

  feature("Tag Pages Football Nav") {

    scenario("Tags that are football competitions that have teams, link to that place on the teams page") {

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
