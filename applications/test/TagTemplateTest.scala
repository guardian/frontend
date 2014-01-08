package test

import org.scalatest.Matchers
import org.scalatest.FlatSpec
import common.UsesElasticSearch

class TagTemplateTest extends FlatSpec with Matchers with UsesElasticSearch {

  it should "render tag headline" in HtmlUnit("/world/turkey") { browser =>
    import browser._

    $(".container__title").first.getText should be ("Turkey")
  }
}
