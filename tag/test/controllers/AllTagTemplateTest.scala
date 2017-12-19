package controllers

import org.scalatest.{DoNotDiscover, FlatSpec, Matchers}
import test.ConfiguredTestSuite

@DoNotDiscover class AllTagTemplateTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  it should "render the /all page and navigate backwards and forwards" in goTo("/world/2014/oct/02/all") { browser =>
    import browser._

    url() should endWith("/world/2014/oct/02/all")
    el("[rel=next]").attribute("href") should endWith ("/world/2014/oct/03/altdate")
    el("[rel=next]").click()
    url() should endWith("/world/2014/oct/03/all")

    el("[rel=prev]").click()
    url() should endWith("/world/2014/oct/02/all")

    el("[rel=prev]").click()
    url() should endWith("/world/2014/oct/01/all")
  }
}
