package test

import org.fluentlenium.core.domain.FluentWebElement
import play.api.GlobalSettings
import controllers.front.{Front, FrontLifecycle}
import common.editions.Uk
import dev.DevParametersLifecycle
import common.Editionalise

object FrontTestGlobal extends GlobalSettings with FrontLifecycle with DevParametersLifecycle {

  override def onStart(app: play.api.Application) {
    //Front.start()
    Front.refresh()

    val start = System.currentTimeMillis

    while (Front(Editionalise("", Uk)).size < 9) {
      // ensure we don't get in an endless loop if test data changes
      if (System.currentTimeMillis - start > 10000) throw new RuntimeException("front should have loaded by now")
    }
  }

  override def onStop(app: play.api.Application) {
    // do not stop the agents
  }
}

object `package` {

  object Fake extends FakeApp {
    override val globalSettingsOverride = Some(FrontTestGlobal)
  }

  object HtmlUnit extends EditionalisedHtmlUnit {
    override val globalSettingsOverride = Some(FrontTestGlobal)
  }

  implicit class WebElement2rich(element: FluentWebElement) {
    lazy val href = element.getAttribute("href")
    def hasAttribute(name: String) = element.getAttribute(name) != null
  }
}