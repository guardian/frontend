package test

import org.scalatest.Matchers
import org.scalatest.FlatSpec

class SectionTemplateTest extends FlatSpec with Matchers {

  it should "render front title" in HtmlUnit("/uk-news") { browser =>
    import browser._
    $(".container__title").first.getText should be ("UK news")
  }
}
