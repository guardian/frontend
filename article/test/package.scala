package test

import org.scalatest.Tag

object ArticleComponents extends Tag("article components")

object `package` {

  object HtmlUnit extends EditionalisedHtmlUnit("9001")

  object Fake extends FakeApp("9001")
}