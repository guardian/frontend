package common.dfp

import org.scalatest.{FlatSpec, Matchers}

class PageSkinTest extends FlatSpec with Matchers {

  "isValidAdUnit" should "be false for a keyword page that's been replaced by a pressed front" in {
    // keyword pages should be targeted by keyword instead of by ad unit
    PageSkin.isValidAdUnit("/123456/root/technology/subsection/ng") shouldBe false
  }

  it should "be true for a section front" in {
    PageSkin.isValidAdUnit("/123456/root/technology/front/ng") shouldBe true
  }

  it should "be false for a content page" in {
    PageSkin.isValidAdUnit("/123456/root/uk-news/article/ng") shouldBe false
  }
}
