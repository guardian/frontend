package test


import controllers.ArchiveController
import model.{ApplicationContext, ApplicationIdentity}
import play.api.mvc.Result
import play.api.test.Helpers._
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover, FlatSpec, Matchers}
import play.api.Environment
import scala.concurrent.Future
import services.RedirectService
import services.RedirectService.{ArchiveRedirect, PermanentRedirect}

@DoNotDiscover class ArchiveControllerTest
  extends FlatSpec
  with Matchers
  with ConfiguredTestSuite
  with WithTestExecutionContext
  with BeforeAndAfterAll
  with WithMaterializer
  with WithTestWsClient {

  lazy val mockRedirects = new RedirectService {
    override def lookupRedirectDestination(source: String) = Future.successful(None)
  }
  lazy val archiveController = new ArchiveController(mockRedirects, play.api.test.Helpers.stubControllerComponents(), wsClient)

  it should "return a normalised r1 path" in {
    val tests = List(
      "/books/reviews/travel/0,,343395,00.html" -> "/books/reviews/travel/0,,343395,.html",
      "/books/reviews/travel/0,,343395,.html" -> "/books/reviews/travel/0,,343395,.html",
      "/books/review/story/0,034,908973,00.html" -> "/books/review/story/0,,908973,.html",
      "/books/reviews/travel/foo" -> "/books/reviews/travel/foo"
    )
    tests foreach {
      case (k, v) => archiveController.normalise(k) should be (v)
    }
  }

  // r1 curio (all the redirects have their 00's removed, all the s3 archived files don't)
  it should "return a normalised r1 path with suffixed zeros" in {
    val path = "/books/reviews/travel/0,,343395,.html"
    val expectedPath = "/books/reviews/travel/0,,343395,00.html"
    archiveController.normalise(path , zeros = "00") should be (expectedPath)
  }

  it should "return a normalised short url path" in {
    val tests = List(
      "/p/dfas/stw" -> "/p/dfas",
      "/p/dfas" -> "/p/dfas"
    )
    tests foreach {
      case (k, v) => archiveController.normalise(k) should be (v)
    }
  }

  it should "not decode encoded urls" in {
    val result = archiveController.lookup("/foo/%2Cfoo")(TestRequest())
    status(result) should be(404)

    val combinerPattern = archiveController.lookup("/foo+foo+foo")(TestRequest())
    status(combinerPattern) should be (404)
  }

  it should "decode encoded spaces as + for tag combiners" in {
    val result = archiveController.lookup("/foo%20foo")(TestRequest())
    status(result) should be (301)
    location(result) should be ("/foo+foo")
  }

  it should "redirect old style galleries" in {
    val result = archiveController.lookup("/arts/gallery/0,")(TestRequest())
    status(result) should be (301)
    location(result) should be ("/arts/pictures/0,")
  }

  it should "test a redirect doesn't link to itself" in {
    val path = "/books/worldliteraturetour/page/0,,2021886,.html"
    val dest = "http://books.theguardian.com/worldliteraturetour/page/0,,2021886,.html"
    archiveController.linksToItself(path, dest) should be (true)
  }

  it should "lowercase the section of the url" in {
    val result = archiveController.lookup("/Football/News_Story/0,1563,1655638,00.html")(TestRequest())
    status(result) should be (301)
    location(result) should be ("/football/News_Story/0,1563,1655638,00.html")
  }

  it should "redirect century urls correctly" in {
    val result = archiveController.lookup("/century")(TestRequest())
    status(result) should be (301)
    location(result) should be ("/world/2014/jul/31/-sp-how-the-guardian-covered-the-20th-century")
  }

  it should "redirect century decade urls correctly" in {
    val result = archiveController.lookup("/1899-1909")(TestRequest())
    status(result) should be (301)
    location(result) should be ("/world/2014/jul/31/-sp-how-the-guardian-covered-the-20th-century")
  }

  it should "redirect an R1 century article to a corrected decade story endpoint" in {
    val result = archiveController.lookup("/1899-1909/Story/0,,126404,00.html")(TestRequest())
    status(result) should be (301)
    location(result) should be ("/century/1899-1909/Story/0,,126404,00.html")
  }

  it should "not redirect a random URL that contains the word century" in {
    val result = archiveController.lookup("/discover-culture/2014/jul/22/mid-century-textiles-then-and-now")(TestRequest())
    status(result) should be (404)
  }

  it should "redirect failed combiners to the (non-editionalised) section" in {
    val result = archiveController.lookup("/opinion/tvandradioblog+media/chris-evans")(TestRequest())
    status(result) should be (301)
    location(result) should be ("/opinion")

    val result2 = archiveController.lookup("/opinion+media/chris-evans")(TestRequest())
    status(result2) should be (301)
    location(result2) should be ("/opinion")
  }

  it should "redirect paths that start with /Guardian/" in {
    val result = archiveController.lookup("/Guardian/world/2005/jun/21/hearafrica05.development3")(TestRequest())
    status(result) should be (301)
    location(result) should be ("/world/2005/jun/21/hearafrica05.development3")
  }

  it should "redirect failed combiners RSS to the (non-editionalised) section RSS" in {
    val result = archiveController.lookup("/opinion/tvandradioblog+media/chris-evans/rss")(TestRequest())
    status(result) should be (301)
    location(result) should be ("/opinion/rss")

    val result2 = archiveController.lookup("/opinion+media/chris-evans/rss")(TestRequest())
    status(result2) should be (301)
    location(result2) should be ("/opinion/rss")
  }

  it should "redirect /week pages" in {

    val result = archiveController.lookup("/news/datablog/2013/jun/19/week")(TestRequest())
    status(result) should be (301)

    location(result) should be ("/news/datablog/2013/jun/19/all")

    val result2 = archiveController.lookup("/news/2013/jun/19/week")(TestRequest())
    status(result2) should be (301)
    location(result2) should be ("/news/2013/jun/19/all")
  }

  it should "handle /week pages for editionalised sections" in {

    val ukResult = archiveController.lookup("/sport/2015/jun/01/week")(TestRequest())
    status(ukResult) should be (301)
    location(ukResult) should be ("/uk/sport/2015/jun/01/all")

    val australiaRequest = TestRequest().withHeaders("X-GU-Edition" -> "AU")
    val auResult = archiveController.lookup("/sport/2015/jun/01/week")(australiaRequest)
    status(auResult) should be (301)
    location(auResult) should be ("/au/sport/2015/jun/01/all")

  }

  it should "redirect /lead pages" in {

    val result = archiveController.lookup("/news/datablog/2013/jun/19/lead")(TestRequest())
    status(result) should be (301)
    location(result) should be ("/news/datablog/2013/jun/19/all")

    val result2 = archiveController.lookup("/news/2013/jun/19/lead")(TestRequest())
    status(result2) should be (301)
    location(result2) should be ("/news/2013/jun/19/all")

    val result3 = archiveController.lookup("/commentisfree/lead")(TestRequest())
    status(result3) should be (301)
    location(result3) should be ("/uk/commentisfree/all")
  }

  it should "handle /lead pages for editionalised sections" in {

    val ukResult = archiveController.lookup("/sport/2015/jun/01/lead")(TestRequest())
    status(ukResult) should be (301)
    location(ukResult) should be ("/uk/sport/2015/jun/01/all")

    val australiaRequest = TestRequest().withHeaders("X-GU-Edition" -> "AU")
    val auResult = archiveController.lookup("/sport/2015/jun/01/lead")(australiaRequest)
    status(auResult) should be (301)
    location(auResult) should be ("/au/sport/2015/jun/01/all")

  }

  it should "handle dated newspaper pages" in {
    val result = archiveController.lookup("/theguardian/2015/jun/18/sport/news")(TestRequest())
    status(result) should be (301)
    location(result) should be ("/theguardian/sport/news/2015/jun/18/all")

    val result2 = archiveController.lookup("/theobserver/2015/jun/14/sport/news")(TestRequest())
    status(result2) should be (301)
    location(result2) should be ("/theobserver/sport/news/2015/jun/14/all")

    val result3 = archiveController.lookup("/theobserver/2015/jun/14/news")(TestRequest())
    status(result3) should be (301)
    location(result3) should be ("/theobserver/news/2015/jun/14/all")
  }

  it should "redirect short urls with campaign codes" in {

    val result = archiveController.retainShortUrlCampaign("http://www.theguardian.com/p/old/stw", "http://www.theguardian.com/p/new")
    result should be("http://www.theguardian.com/p/new?CMP=share_btn_tw")
  }

  it should "redirect short urls with campaign codes and allow for overrides" in {
    val path = "http://www.theguardian.com/p/old/stw"
    val shortRedirectWithCMP = PermanentRedirect(path, "http://www.theguardian.com/p/new?CMP=existing-cmp")
    val result = archiveController.retainShortUrlCampaign(path, shortRedirectWithCMP.location)
    result should be (shortRedirectWithCMP.location)
  }

  it should "not perform a redirect loop check on Archive objects" in {
    // The archive x-accel goes to s3. So it is irrelevant whether the original path looks like the s3 archive path.
    val path = "http://www.theguardian.com/redirect/path-to-content"
    val databaseSaysArchive = ArchiveRedirect("any", path)
    val result = archiveController.processLookupDestination(path)(TestRequest()).lift(databaseSaysArchive)
    result.map(_.toString).getOrElse("") should include (s"""X-Accel-Redirect -> /s3-archive/$path""")
  }

  private def location(result: Future[Result]): String = header("Location", result).head

}
