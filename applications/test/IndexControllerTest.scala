package test

import contentapi.SectionsLookUp
import play.api.test._
import play.api.test.Helpers._
import org.scalatest.{DoNotDiscover, BeforeAndAfterAll, Matchers, FlatSpec}
import conf.switches.Switches.MemcachedSwitch

@DoNotDiscover class IndexControllerTest extends FlatSpec with Matchers with BeforeAndAfterAll with ConfiguredTestSuite{

  val section = "books"

  override def beforeAll(): Unit = {
    MemcachedSwitch.switchOff()
    SectionsLookUp.refresh()
  }

  override def afterAll(): Unit = {
    MemcachedSwitch.switchOn()
  }

  "Index Controller" should "200 when content type is front" in {
    val result = controllers.IndexController.render(section)(TestRequest(s"/$section"))
    status(result) should be(200)
  }

  it should "return JSON when .json format is supplied to front" in {
    val fakeRequest = TestRequest(s"/$section.json")
      .withHeaders("host" -> "localhost:9000")
      .withHeaders("Origin" -> "http://www.theorigin.com")

    val result = controllers.IndexController.render(section)(fakeRequest)
    status(result) should be(200)
    header("Content-Type", result).get should be("application/json; charset=utf-8")
    contentAsString(result) should startWith("{\"html\"")
  }

  it should "internal redirect when content type is not front" in {
    val result = controllers.IndexController.render("world/video/2012/feb/10/inside-tibet-heart-protest-video")(TestRequest("/world/video/2012/feb/10/inside-tibet-heart-protest-video"))
    status(result) should be(200)
    header("X-Accel-Redirect", result).get should be("/applications/world/video/2012/feb/10/inside-tibet-heart-protest-video")
  }

  it should "200 when content type is front trails" in {
    val result = controllers.IndexController.renderTrails(section)(TestRequest(s"/$section"))
    status(result) should be(200)
  }

  it should "redirect when content api says it is on the wrong web url" in {

    val result = controllers.IndexController.render("type/video")(TestRequest("/type/video"))

    status(result) should be (302)
    header("Location", result).get should be ("/video")
  }

  it should "correctly redirect short urls to other servers" in {

    val result = controllers.IndexController.render("p/3jdag")(TestRequest("/p/3jdag"))

    status(result) should be (302)
    header("Location", result).get should be ("/music/2013/oct/11/david-byrne-internet-content-world")
  }

  it should "return JSON when .json format is supplied to front trails" in {
    val fakeRequest = FakeRequest(GET, s"$section/trails.json")
      .withHeaders("host" -> "localhost:9000")
      .withHeaders("Origin" -> "http://www.theorigin.com")

    val result = controllers.IndexController.renderTrails(section)(fakeRequest)
    status(result) should be(200)
    header("Content-Type", result).get should be("application/json; charset=utf-8")
    contentAsString(result) should startWith("{\"html\"")
  }

  it should "redirect tag to first page if pagination goes beyond last page" in {

    val request = FakeRequest(GET, "/sport/cycling?page=10000")
    val result = controllers.IndexController.render("/sport/cycling")(request)

    // temporary as this page may well exist tomorrow
    status(result) should be (302)
    header("Location", result).get should endWith ("/sport/cycling")

  }

  it should "redirect tag combiner to first page if pagination goes beyond last page" in {

    val request = FakeRequest(GET, "/books+tone/reviews?page=10000")
    val result = controllers.IndexController.renderCombiner("books", "tone/reviews")(request)

    // temporary as this page may well exist tomorrow
    status(result) should be (302)
    header("Location", result).get should endWith ("/books+tone/reviews")
  }

  it should "remove editions from section tags on all pages" in {
    val request = FakeRequest(GET, "/uk/culture/all")
    val result = controllers.IndexController.render("uk/culture")(request)

    status(result) should be (302)

    header("Location", result).get should be ("/culture/all")
  }

  it should "remove editions past the first page of section tags" in {
    val request = FakeRequest(GET, "/uk/business?page=2")
    val result = controllers.IndexController.render("uk/business")(request)

    status(result) should be (302)

    header("Location", result).get should be ("/business?page=2")
  }

  it should "not accidentally truncate tags that contain valid strings that are also editions" in {
    val request = FakeRequest(GET, "/uk/london?page=2")
    val result = controllers.IndexController.render("uk/london")(request)

    status(result) should be (200)
  }

  it should "not add editions to section tags" in {
    val request = FakeRequest(GET, "/sport?page=2")
    val result = controllers.IndexController.render("sport")(request)

    status(result) should be (200)
  }

  "Normalise tags" should "convert content/gallery to type/gallery" in {
    val tag = "content/gallery"
    val result = controllers.IndexController.normaliseTag(tag)
    result should be ("type/gallery")
  }

  it should "not touch other tags that don't match content exactly" in {
    val tags = Seq("conten/gallery", "contentt/gallery", "content",
      "type/gallery", "media/media", "media", "content", "type")
    tags.map{ tag =>
      val result = controllers.IndexController.normaliseTag(tag)
      result should be (tag)
    }
  }

  it should "serve RSS for a section" in {
    val result = controllers.IndexController.render("books")(TestRequest("/books/rss"))
    status(result) should be(200)
    contentType(result) should be(Some("text/xml"))
    contentAsString(result) should startWith("<?xml")
  }

  it should "resolve uk-news combiner pages" in {
    val result = controllers.IndexController.renderCombiner("uk-news/series/writlarge", "law/trial-by-jury")(TestRequest("/uk-news/series/writlarge+law/trial-by-jury"))
    status(result) should be(200)

    val result2 = controllers.IndexController.renderCombiner("uk-news/the-northerner", "blackpool")(TestRequest("/uk-news/the-northerner+blackpool"))
    status(result2) should be(200)
  }

  it should "redirect 'section tags' to the section page" in {
    val result = controllers.IndexController.render("sustainable-business-grundfos-partner-zone/sustainable-business-grundfos-partner-zone")(TestRequest())
    status(result) should be(301)
    header("Location", result).head should be ("/sustainable-business-grundfos-partner-zone")
  }
}
