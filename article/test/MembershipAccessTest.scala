package test

import conf.switches.Switches
import org.scalatest.concurrent.ScalaFutures
import org.scalatest._

@DoNotDiscover class MembershipAccessTest extends FeatureSpec with GivenWhenThen with Matchers with BeforeAndAfter with ConfiguredTestSuite with ScalaFutures {

  feature("Membership Access") {

    val accessSelector = ".has-membership-access-requirement"
    val accessUrl = "/membership/2015/apr/27/the-spin-london-cycle-festival-save-mop"

    scenario("Membership access classname should be set on matching articles", ArticleComponents) {

      Switches.MembersAreaSwitch.switchOn()

      Given("I am on an article under /membership/ with membershipAccess field set")

      goTo(accessUrl) { browser =>
        import browser._

        Then("The page should have the appropriate class name")
        $(accessSelector).size shouldEqual 1
      }
    }

    scenario("Membership access classname should not be set when MembersAreaSwitch is off", ArticleComponents) {

      Switches.MembersAreaSwitch.switchOff()

      Given("the MembersAreaSwitch is off")

      goTo(accessUrl) { browser =>
        import browser._

        Then("The page should not have the access class name")
        $(accessSelector).size shouldEqual 0
      }
    }

    scenario("Membership access classname should not be set when the article does not require membership access", ArticleComponents) {

      Switches.MembersAreaSwitch.switchOn()

      Given("the article does not require membership access")

      goTo("/membership/2015/apr/23/irvine-welsh-trainspotting-jesse-armstrong-peep-show-how-to-write-comedy") { browser =>
        import browser._

        Then("The page should not have the access class name")
        $(accessSelector).size shouldEqual 0
      }
    }

    scenario("Membership access classname should not be set on articles outside /membership", ArticleComponents) {

      Switches.MembersAreaSwitch.switchOn()

      Given("the article is not under /membership")

      goTo("/business/live/2015/apr/27/greek-finance-minister-debt-talks-eurozone-live") { browser =>
        import browser._

        Then("The page should not have the access class name")
        $(accessSelector).size shouldEqual 0
      }

      goTo("/fashion/2015/apr/27/music-festivals-fashion-shows") { browser =>
        import browser._

        Then("The page should not have the access class name")
        $(accessSelector).size shouldEqual 0
      }
    }
  }

}
