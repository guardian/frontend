package test

import org.scalatest.Matchers
import org.scalatest.FlatSpec
import common.UsesElasticSearch

class TagTemplateTest extends FlatSpec with Matchers with UsesElasticSearch {

  it should "render tag headline" in HtmlUnit("/world/turkey") { browser =>
    import browser._

    $("h2 a").first.getText should be ("Turkey")
  }
}
