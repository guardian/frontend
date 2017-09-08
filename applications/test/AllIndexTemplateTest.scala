package test

import org.scalatest.{DoNotDiscover, Matchers, FlatSpec}

@DoNotDiscover class AllIndexTemplateTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  it should "render the /all page and navigate backwards and forwards" in goTo("/world/2014/oct/02/all") { browser =>
    import browser._

    url() should endWith("/world/2014/oct/02/all")
    $("[rel=next]").first.getAttribute("href") should endWith ("/world/2014/oct/03/altdate")
    $("[rel=next]").first.click()
    url() should endWith("/world/2014/oct/03/all")

    $("[rel=prev]").first.click()
    url() should endWith("/world/2014/oct/02/all")

    $("[rel=prev]").first.click()
    url() should endWith("/world/2014/oct/01/all")
  }
}
