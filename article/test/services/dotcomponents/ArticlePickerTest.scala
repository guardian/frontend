package services.dotcomponents

import model.{PageWithStoryPackage}
import org.scalatest.{DoNotDiscover, FlatSpec, FunSuite, Matchers}
import test.TestRequest

@DoNotDiscover class ArticlePickerTest extends FlatSpec with Matchers {

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

  it should "return RemoteRender if force DCR and content is pressed" in {
    val testRequest = TestRequest("article-path?dcr=true")
    val tier = ArticlePicker.decideTier(true, true)(testRequest)
    tier should be(RemoteRender)
  }

  it should "return PressedArticle if isPressed and no flag provided" in {
    val testRequest = TestRequest("article-path")
    val tier = ArticlePicker.decideTier(true, true)(testRequest)
    tier should be(PressedArticle)
  }

  it should "return RemoteRender if dcr can render and article is not pressed" in {
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
