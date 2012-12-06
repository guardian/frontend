package test

import conf.Configuration
import org.fluentlenium.core.domain.FluentWebElement
import play.api.test.TestBrowser

object `package` {

  object HtmlUnit extends EditionalisedHtmlUnit {

    import Configuration.edition._

    override def UK[T](path: String)(block: TestBrowser => T): T = {
      goTo("/_warmup", "http://" + ukHost)(browser => Unit)
      super.UK(path)(block)
    }

    override def US[T](path: String)(block: TestBrowser => T): T = {
      goTo("/_warmup", "http://" + usHost)(browser => Unit)
      super.US(path)(block)
    }
  }

  implicit def webElement2rich(element: FluentWebElement) = new {
    lazy val href = element.getAttribute("href")
    def hasAttribute(name: String) = element.getAttribute(name) != null
  }
}