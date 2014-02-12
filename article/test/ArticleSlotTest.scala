package test.slotgeneration

import common.UsesElasticSearch
import org.jsoup.Jsoup
import org.scalatest.{ Matchers, FlatSpec }
import play.api.test.Helpers._
import scala.collection.JavaConverters._
import test.{ Fake, TestRequest }

class ArticleSlotTest extends FlatSpec with Matchers  with UsesElasticSearch {

  // These tests check the InlineSlotGenerator behaviour. Placing them in article's
  // tests allows us to use the test http recorder rather than stub data.

  val slotTest1= "media/2014/jan/29/blog-turns-twenty-conversation-internet-pioneers"

  "Slot generation" should "create slots in an article body" in Fake {
    val result = controllers.ArticleController.renderArticle(slotTest1)(TestRequest(slotTest1))
    val document = Jsoup.parse(contentAsString(result))
    document.select(".article-body .slot") should have size 10
  }

  "Slot generation" should "only create pre-header slots before h2 elements" in Fake {
    val result = controllers.ArticleController.renderArticle(slotTest1)(TestRequest(slotTest1))
    val document = Jsoup.parse(contentAsString(result))
    val elements = document.select(".article-body .slot--preh2").asScala

    elements should have size 5

    for (element <- elements) {
      val sibling = element.nextElementSibling()
      sibling should not be (null)
      sibling.tagName should be ("h2")
    }
  }

  "Slot generation" should "only create post-header slots after h2 elements" in Fake {
    val result = controllers.ArticleController.renderArticle(slotTest1)(TestRequest(slotTest1))
    val document = Jsoup.parse(contentAsString(result))
    val elements = document.select(".article-body .slot--posth2").asScala

    elements should have size 5

    for (element <- elements) {
      val sibling = element.previousElementSibling()
      sibling should not be (null)
      sibling.tagName should be ("h2")
    }
  }
}