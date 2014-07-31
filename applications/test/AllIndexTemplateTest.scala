package test

import org.scalatest.{Matchers, FlatSpec}

class AllIndexTemplateTest extends FlatSpec with Matchers {

  it should "render the /all page and navigate backwards and forwards" in HtmlUnit("/world/2013/mar/31/all") { browser =>
    import browser._

    url() should endWith("/world/2013/mar/31/all")
    $("[rel=next]").first.getAttribute("href") should endWith ("/world/2013/apr/01/newer")
    $("[rel=next]").first.click()
    url() should endWith("/world/2013/apr/01/all")

    $("[rel=prev]").first.click()
    $("[rel=prev]").first.click()
    url() should endWith("/world/2013/mar/30/all")
  }
}
