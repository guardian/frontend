package services.dotcomponents

import model.{PageWithStoryPackage}
import org.scalatest.{DoNotDiscover, FlatSpec, FunSuite, Matchers}
import test.TestRequest

@DoNotDiscover class ArticlePickerTest extends FlatSpec with Matchers {

  "Article Picker calculateTier" should "return FrontendLegacy if forceDCROff and dcr cannot render" in {
    val testRequest = TestRequest("article-path?dcr=false")
    val tier = ArticlePicker.calculateTier(false, false)(testRequest)
    tier should be(FrontendLegacy)
  }

  it should "return FrontendLegacy if forceDCROff and dcrCanRender" in {
    val testRequest = TestRequest("article-path?dcr=false")
    val tier = ArticlePicker.calculateTier(false, true)(testRequest)
    tier should be(FrontendLegacy)
  }

  it should "return PressedArtcile if isPressed" in {
    val testRequest = TestRequest("article-path")
    val tier = ArticlePicker.calculateTier(true, true)(testRequest)
    tier should be(PressedArticle)
  }

  it should "return DotcomRendering if dcr can render" in {
    val testRequest = TestRequest("article-path")
    val tier = ArticlePicker.calculateTier(false, true)(testRequest)
    tier should be(DotcomRendering)
  }

  it should "return DotcomRendering if force dcr" in {
    val testRequest = TestRequest("article-path?dcr=true")
    val tier = ArticlePicker.calculateTier(false, true)(testRequest)
    tier should be(DotcomRendering)
  }

  it should "return FrontendLegacy otherwise" in {
    val testRequest = TestRequest("article-path")
    val tier = ArticlePicker.calculateTier(false, false)(testRequest)
    tier should be(FrontendLegacy)
  }
}
