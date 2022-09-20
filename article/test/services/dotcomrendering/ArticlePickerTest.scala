package services.dotcomrendering

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatest.DoNotDiscover
import services.dotcomrendering.{ArticlePicker, LocalRenderArticle, PressedArticle, RemoteRender}
import test.TestRequest

@DoNotDiscover class ArticlePickerTest extends AnyFlatSpec with Matchers {

  "Article Picker decideTier" should "return LocalRenderArticle if forceDCROff and dcr cannot render" in {
    val testRequest = TestRequest("article-path?dcr=false")
    val tier = ArticlePicker.decideTier(false, false)(testRequest)
    tier should be(LocalRenderArticle)
  }

  it should "return LocalRenderArticle if forceDCROff and dcrCanRender" in {
    val testRequest = TestRequest("article-path?dcr=false")
    val tier = ArticlePicker.decideTier(false, true)(testRequest)
    tier should be(LocalRenderArticle)
  }

  it should "return RemoteRender if force DCR" in {
    val testRequest = TestRequest("article-path?dcr=true")
    val tier = ArticlePicker.decideTier(false, true)(testRequest)
    tier should be(RemoteRender)
  }

  it should "return RemoteRender if force DCR and content should be served pressed" in {
    val testRequest = TestRequest("article-path?dcr=true")
    val tier = ArticlePicker.decideTier(true, true)(testRequest)
    tier should be(RemoteRender)
  }

  it should "return PressedArticle if isPressed and no flag provided" in {
    val testRequest = TestRequest("article-path")
    val tier = ArticlePicker.decideTier(true, true)(testRequest)
    tier should be(PressedArticle)
  }

  it should "return RemoteRender if dcr can render and article should not be served pressed" in {
    val testRequest = TestRequest("article-path")
    val tier = ArticlePicker.decideTier(false, true)(testRequest)
    tier should be(RemoteRender)
  }

  it should "return LocalRenderArticle otherwise" in {
    val testRequest = TestRequest("article-path")
    val tier = ArticlePicker.decideTier(false, false)(testRequest)
    tier should be(LocalRenderArticle)
  }
}
