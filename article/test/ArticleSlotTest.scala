package test.slotgeneration

import org.jsoup.Jsoup
import org.scalatest.{BeforeAndAfterEach, Matchers, FlatSpec}
import play.api.test.Helpers._
import scala.collection.JavaConverters._
import test.{ Fake, TestRequest }
import model.`package`._
import conf.Switches.ArticleSlotsSwitch

class ArticleSlotTest extends FlatSpec with Matchers with BeforeAndAfterEach {

  // These tests check the InlineSlotGenerator behaviour. Placing them in article's
  // tests allows us to use the test http recorder rather than stub data.
  override def beforeEach() {
    ArticleSlotsSwitch.switchOn()
  }

  override def afterEach(){
    ArticleSlotsSwitch.switchOff()
  }

  val slotTest1 = "media/2014/jan/29/blog-turns-twenty-conversation-internet-pioneers"
  val slotTest2 = "travel/2014/jan/09/bargain-beach-houses-around-world"
  val slotTest3 = "film/filmblog/2013/dec/18/hobbit-desolation-of-smaug-frozen-hunger-games"

  "Slot generation" should "create slots in an article body" in Fake {
    val result = controllers.ArticleController.renderArticle(slotTest1)(TestRequest(slotTest1))
    val document = Jsoup.parse(contentAsString(result))
    document.select(".js-article__body .slot") should have size 10
  }

  it should "only create pre-header slots before h2 elements" in Fake {
    val result = controllers.ArticleController.renderArticle(slotTest1)(TestRequest(slotTest1))
    val document = Jsoup.parse(contentAsString(result))
    val elements = document.select(".js-article__body .slot--preh2").asScala

    elements should have size 5

    for (element <- elements) {
      val sibling = element.nextElementSibling()
      sibling should not be (null)
      sibling.tagName should be ("h2")
    }
  }

  it should "only create post-header slots after h2 elements" in Fake {
    val result = controllers.ArticleController.renderArticle(slotTest1)(TestRequest(slotTest1))
    val document = Jsoup.parse(contentAsString(result))
    val elements = document.select(".js-article__body .slot--posth2").asScala

    elements should have size 5

    for (element <- elements) {
      val sibling = element.previousElementSibling()
      sibling should not be (null)
      sibling.tagName should be ("h2")
    }
  }

  it should "create block slots after block image elements" in Fake {
    val result = controllers.ArticleController.renderArticle(slotTest2)(TestRequest(slotTest2))
    val document = Jsoup.parse(contentAsString(result))
    val elements = document.select(".js-article__body .slot--block").asScala

    elements should have size 1

    for (element <- elements) {
      val sibling = element.previousElementSibling()
      sibling should not be (null)
      sibling.classNames.asScala should contain ("img")
      sibling.classNames.asScala should not contain ("img--inline")
    }
  }

  it should "create block slots after video elements" in Fake {
    val result = controllers.ArticleController.renderArticle(slotTest3)(TestRequest(slotTest3))
    val document = Jsoup.parse(contentAsString(result))
    val elements = document.select(".js-article__body .slot--block").asScala

    elements should have size 1

    for (element <- elements) {
      val sibling = element.previousElementSibling()
      sibling should not be (null)
      sibling.classNames.asScala should contain ("gu-video-wrapper")
    }
  }

  it should "create spacing inbetween slots with a minimum length of 850" in Fake {
    val result = controllers.ArticleController.renderArticle(slotTest1)(TestRequest(slotTest1))
    val document = Jsoup.parse(contentAsString(result))
    val elements = document.select(".slot--posth2, .slot--block").asScala
    val elementSiblings = document.select(".js-article__body").first.children.asScala

    elements should not be (empty)

    // Count the characters between slots.
    for { pair <- elements.sliding(2)
    } {
      val start = pair.head.elementSiblingIndex() + 1
      val end = pair.last.elementSiblingIndex()
      val els = elementSiblings.view(start, end).filter(_.tagName().in(Set("h2", "p")))

      val characterCount = els.foldLeft(0){_ + _.text.length}

      characterCount should be > 850
    }
  }

  it should "render sponsor badge slot" in Fake {
    val result = controllers.ArticleController.renderArticle(slotTest1)(TestRequest(slotTest1))
    val document = Jsoup.parse(contentAsString(result))

    val adSlots = document.select(".ad-slot--paid-for-badge")
    adSlots.size() should be(1)

    val adSlot = adSlots.first()
    adSlot.attr("data-name") should be("spbadge")

    val containers = adSlot.select(".ad-slot__container")
    containers.size() should be(1)

    val container = containers.first()
    container.id() should be("dfp-ad--spbadge")
  }
}
