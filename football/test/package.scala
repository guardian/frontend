package test

import conf.Configuration
import play.api.test.TestBrowser

object `package` {
  object HtmlUnit extends EditionalisedHtmlUnit(Configuration) {

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
}