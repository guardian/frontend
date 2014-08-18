package test

import org.scalatest.{Matchers,FlatSpec}

class SectionTemplateTest extends FlatSpec with Matchers {

  it should "render front title" in HtmlUnit("/uk-news") { browser =>
    browser.$(".container__meta__title").first.getText should be ("UK news")
  }
}
