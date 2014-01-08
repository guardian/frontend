package test

import org.scalatest.Matchers
import org.scalatest.FlatSpec
import common.UsesElasticSearch

class SectionTemplateTest extends FlatSpec with Matchers with UsesElasticSearch {

  it should "render front title" in HtmlUnit("/uk-news") { browser =>
    import browser._
    $(".container__title").first.getText should be ("UK news")
  }
}
