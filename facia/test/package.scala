package test

import org.fluentlenium.core.domain.FluentWebElement
import org.scalatest.Suites

object `package` {

  implicit class WebElement2rich(element: FluentWebElement) {
    lazy val href = element.getAttribute("href")
    def hasAttribute(name: String) = element.getAttribute(name) != null
  }
}

class FaciaTestSuite extends Suites (
  new controllers.front.FaciaDefaultsTest,
  new services.FaciaHealthcheckTest,
  new slices.DynamicFastTest,
  new slices.DynamicSlowTest,
  new slices.StoryTest,
  new views.fragments.nav.NavigationTest,
  new FaciaControllerTest ) with SingleServerSuite {

  override lazy val port: Int = conf.HealthCheck.testPort
}