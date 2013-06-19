package test

import org.scalatest.{BeforeAndAfterAll, FeatureSpec}
import org.scalatest.matchers.ShouldMatchers
import  play.api.test.Helpers._
import play.api.test.TestServer
import play.api.test.FakeApplication

class SwitchboardFeatureTest extends FeatureSpec with ShouldMatchers with BeforeAndAfterAll {

  feature("Switchboard") {

    scenario("turn a switch 'on'") {

      running(TestServer(3333, FakeApplication()), HTMLUNIT) { browser =>
        import browser._

        goTo("http://localhost:3333/dev/switchboard")

        val testSwitch = findFirst("[name=integration-test-switch]")

        Option(testSwitch.getAttribute("checked")) should be (None)

        testSwitch.click()

        findFirst("form").submit()

        findFirst("[name=integration-test-switch]").getAttribute("checked") should be ("true")
      }
    }

    scenario("turn a switch 'off'") {

      running(TestServer(3333, FakeApplication()), HTMLUNIT) { browser =>
        import browser._

        browser.goTo("http://localhost:3333/dev/switchboard")

        val testSwitch = findFirst("[name=integration-test-switch]")

        testSwitch.getAttribute("checked") should be ("true")

        testSwitch.click()

        findFirst("form").submit()

        Option(findFirst("[name=integration-test-switch]").getAttribute("checked")) should be (None)
      }
    }
  }

  // ensure we start from a known state with the test switch set to 'off'
  beforeAll {
    running(TestServer(3333, FakeApplication()), HTMLUNIT) { browser =>
      import browser._
      browser.goTo("http://localhost:3333/dev/switchboard")
      val testSwitch = findFirst("[name=integration-test-switch]")
      Option(testSwitch.getAttribute("checked")).foreach{ s =>
        testSwitch.click()
        findFirst("form").submit()
      }
      Map.empty
    }
  }
}