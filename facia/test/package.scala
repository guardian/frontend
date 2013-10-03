package test

import org.fluentlenium.core.domain.FluentWebElement
import play.api.GlobalSettings
import controllers.front.{Front, FrontLifecycle}
import dev.DevParametersLifecycle
import common.{AkkaAsync, FrontMetrics, Jobs}
import concurrent.duration._

object `package` {

  object Fake extends FakeApp

  object HtmlUnit extends EditionalisedHtmlUnit

  implicit class WebElement2rich(element: FluentWebElement) {
    lazy val href = element.getAttribute("href")
    def hasAttribute(name: String) = element.getAttribute(name) != null
  }
}