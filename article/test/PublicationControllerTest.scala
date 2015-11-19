package test

import org.scalatest.{BeforeAndAfterAll, DoNotDiscover, FlatSpec, Matchers}
import play.api.test.Helpers._

@DoNotDiscover class PublicationControllerTest extends FlatSpec
                                                with Matchers
                                                with ConfiguredTestSuite
                                                with BeforeAndAfterAll {

  private val PermanentRedirect = 301
  private val TemporaryRedirect = 302
  private val OK = 200

  "Publication Controller" should "redirect to an /all page when an observer dated book url is requested" in {
    val testReq = TestRequest("theobserver/2009/may/17/magazine")
    val result = controllers.PublicationController.publishedOn("theobserver","2009","may","17","magazine")(testReq)
    status(result) should be(PermanentRedirect)
    header("Location",result).getOrElse("") should endWith ("/theobserver/magazine/2009/may/17/all")
  }

  it should "redirect to an /all page when an observer dated book section url is requested" in {
    val testReq = TestRequest("theobserver/2015/nov/01/news/uknews")
    val result = controllers.PublicationController.publishedOn("theobserver", "2015", "nov", "01", "news/uknews")(testReq)
    status(result) should be(PermanentRedirect)
    header("Location",result).getOrElse("") should endWith ("/theobserver/news/uknews/2015/nov/01/all")
  }

  it should "200 when an observer article is requested" in {
    val testReq = TestRequest("theobserver/2014/aug/31/profile-clare-smyth-gordon-ramsay-chef-perfect-ten")
    val result = controllers.PublicationController.publishedOn("theobserver","2014","aug","31","profile-clare-smyth-gordon-ramsay-chef-perfect-ten")(testReq)
    status(result) should be(OK)
  }

  it should "200 when an observer gallery is requested" in {
    val testReq = TestRequest("theobserver/gallery/2013/sep/14/the-10-best-fonts")
    val result = controllers.PublicationController.publishedOn("theobserver/gallery","2013","sep","14","the-10-best-fonts")(testReq)
    status(result) should be(OK)
  }

  it should "redirect to an /all page when an observer dated blog section is requested" in {
    val testReq = TestRequest("theobserver/she-said/2015/jun/15")
    val result = controllers.PublicationController.publishedOn("theobserver/she-said","2015","jun","15","")(testReq)
    status(result) should be(PermanentRedirect)
    header("Location",result).getOrElse("") should endWith ("/theobserver/she-said/2015/jun/15/all")
  }

  it should "200 when an observer dated blog article is requested" in {
    val testReq = TestRequest("theobserver/she-said/2014/apr/17/unisex-changing-rooms-are-depriving-me-of-getting-naked-with-my-fellow-women")
    val result = controllers.PublicationController.publishedOn("theobserver/she-said","2014","apr","17","unisex-changing-rooms-are-depriving-me-of-getting-naked-with-my-fellow-women")(testReq)
    status(result) should be(OK)
  }

  it should "redirect to an /all page when a guardian dated newspaper book url is requested" in {
    val testReq = TestRequest("theguardian/2015/nov/03/mainsection")
    val result = controllers.PublicationController.publishedOn("theguardian","2015","nov","03","mainsection")(testReq)
    status(result) should be(PermanentRedirect)
    header("Location",result).getOrElse("") should endWith ("/theguardian/mainsection/2015/nov/03/all")
  }

  it should "redirect to an /all page when a guardian dated newspaper book section url is requested" in {
    val testReq = TestRequest("theguardian/2015/nov/04/g2/features")
    val result = controllers.PublicationController.publishedOn("theguardian", "2015", "nov", "04", "g2/features")(testReq)
    status(result) should be(PermanentRedirect)
    header("Location",result).getOrElse("") should endWith ("/theguardian/g2/features/2015/nov/04/all")
  }

  it should "200 when a guardian article is requested" in {
    val testReq = TestRequest("theguardian/2012/aug/24/good-to-meet-you-zubair-limbada")
    val result = controllers.PublicationController.publishedOn("theguardian","2014","aug","24","good-to-meet-you-zubair-limbada")(testReq)
    status(result) should be(OK)
  }

  it should "200 when a guardian newspaper book section article is requested" in {
    val testReq = TestRequest("theguardian/2003/jul/26/features.jobsmoney7")
    val result = controllers.PublicationController.publishedOn("theguardian","2003","jul","26","features.jobsmoney7")(testReq)
    status(result) should be(OK)
  }

  it should "200 when a guardian gallery is requested" in {
    val testReq = TestRequest("theguardian/gallery/2009/apr/01/prince-harry-william-monarchy")
    val result = controllers.PublicationController.publishedOn("theguardian/gallery","2009","apr","01","prince-harry-william-monarchy")(testReq)
    status(result) should be(OK)
  }

  it should "redirect to an /all page when a guardian dated blog section is requested" in {
    val testReq = TestRequest("theguardian/from-the-archive-blog/2012/feb/17")
    val result = controllers.PublicationController.publishedOn("theguardian/from-the-archive-blog","2012","feb","17","")(testReq)
    status(result) should be(PermanentRedirect)
    header("Location",result).getOrElse("") should endWith ("/theguardian/from-the-archive-blog/2012/feb/17/all")
  }

  it should "200 when a guardian dated blog article is requested" in {
    val testReq = TestRequest("theguardian/from-the-archive-blog/2012/feb/17/charlie-chaplin-1952-communist")
    val result = controllers.PublicationController.publishedOn("/theguardian/from-the-archive-blog","2012","feb","17","charlie-chaplin-1952-communist")(testReq)
    status(result) should be(OK)
  }

}
