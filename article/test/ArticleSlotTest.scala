package test.slotgeneration

import common.UsesElasticSearch
import org.jsoup.Jsoup
import org.scalatest.{ Matchers, FlatSpec }
import play.api.test.Helpers._
import test.{ Fake, TestRequest }

class ArticleSlotTest extends FlatSpec with Matchers  with UsesElasticSearch {

  val slotTest1= "media/2014/jan/29/blog-turns-twenty-conversation-internet-pioneers"

  "Slot generation" should "create slots in an article body" in Fake {
    val result = controllers.ArticleController.renderArticle(slotTest1)(TestRequest(slotTest1))
    val document = Jsoup.parse(contentAsString(result))
    document.select(".article-body .slot").size should be > 0
    status(result) should be(200)
  }
}