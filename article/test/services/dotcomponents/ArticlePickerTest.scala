package services.dotcomponents

import model.{PageWithStoryPackage}
import org.scalatest.{DoNotDiscover, FlatSpec, FunSuite, Matchers}
import test.TestRequest

@DoNotDiscover class ArticlePickerTest extends FlatSpec with Matchers {

  "Article Picker calculateTier" should "return FrontendLegacy if forceDCROff and dcr cannot render" in {
    val testRequest = TestRequest("article-path?dcr=false")
    val tier = ArticlePicker.decideTier(false, false)(testRequest)
    tier should be(LocalRenderArticle)
  }

  it should "return FrontendLegacy if forceDCROff and dcrCanRender" in {
    val testRequest = TestRequest("article-path?dcr=false")
    val tier = ArticlePicker.decideTier(false, true)(testRequest)
    tier should be(LocalRenderArticle)
  }

  it should "return PressedArtcile if isPressed" in {
    val testRequest = TestRequest("article-path")
    val tier = ArticlePicker.decideTier(true, true)(testRequest)
    tier should be(PressedArticle)
  }

  it should "return DotcomRendering if dcr can render" in {
    val testRequest = TestRequest("article-path")
    val tier = ArticlePicker.decideTier(false, true)(testRequest)
    tier should be(RemoteRender)
  }

  it should "return DotcomRendering if force dcr" in {
    val testRequest = TestRequest("article-path?dcr=true")
    val tier = ArticlePicker.decideTier(false, true)(testRequest)
    tier should be(RemoteRender)
  }

  it should "return FrontendLegacy otherwise" in {
    val testRequest = TestRequest("article-path")
    val tier = ArticlePicker.decideTier(false, false)(testRequest)
    tier should be(LocalRenderArticle)
  }
}
