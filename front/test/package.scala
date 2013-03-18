package test

import org.fluentlenium.core.domain.FluentWebElement
import play.api.GlobalSettings
import controllers.front.{Front, FrontLifecycle}

object FrontTestGlobal extends GlobalSettings with FrontLifecycle{

  override def onStart(app: play.api.Application) {
    //Front.startup()
    Front.refresh()


    //TODO


    println("+++++++++++++++++++++++" + Front("front", "UK").size)
    Thread.sleep(1000)
    println("+++++++++++++++++++++++" + Front("front", "UK").size)
    Thread.sleep(1000)
    println("+++++++++++++++++++++++" + Front("front", "UK").size)
    Thread.sleep(1000)
    println("+++++++++++++++++++++++" + Front("front", "UK").size)
    Thread.sleep(1000)
    println("+++++++++++++++++++++++" + Front("front", "UK").size)

  }

  override def onStop(app: play.api.Application) {
    // do not stop the agents
  }
}

object `package` {

  object Fake extends Fake {
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