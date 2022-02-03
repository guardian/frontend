package services.dotcomponents

import model.{PageWithStoryPackage}
import org.scalatest.{DoNotDiscover, FlatSpec, FunSuite, Matchers}
import test.TestRequest

@DoNotDiscover class ArticlePickerTest extends FlatSpec with Matchers {
  val path = "x"
  val page = ???

  object MockPressedContent {
    private[this] val content = Set[String](path)

    def isPressed(path: String): Boolean = content.contains(path)
  }

  "Article Picker get rendering tier" should "return PressedArticle if pressed" in {
    val testRequest = TestRequest(path)
    val tier = ArticlePicker.getTier(page, path, MockPressedContent.isPressed)(
      testRequest,
    )

    tier should be(PressedArticle)
  }
}
