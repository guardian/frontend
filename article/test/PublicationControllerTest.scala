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
    //val testReq = TestRequest("theobserver/2015/nov/01/the-big-issue-generation-gap-pensioners-young-people")
    //val testReq = TestRequest("theobserver/she-said/2014/apr/17/unisex-changing-rooms-are-depriving-me-of-getting-naked-with-my-fellow-women")
    val testReq = TestRequest("theobserver/2014/aug/31/profile-clare-smyth-gordon-ramsay-chef-perfect-ten")
    //val result = controllers.PublicationController.publishedOn("theobserver","2015","nov","01","the-big-issue-generation-gap-pensioners-young-people")(testReq)
    //val result = controllers.PublicationController.publishedOn("theobserver","2014","apr","17","she-said/unisex-changing-rooms-are-depriving-me-of-getting-naked-with-my-fellow-women")(testReq)
    val result = controllers.PublicationController.publishedOn("theobserver","2014","aug","31","profile-clare-smyth-gordon-ramsay-chef-perfect-ten")(testReq)
    status(result) should be(OK)
  }

  it should "200 when an observer gallery is requested" in {
    val testReq = TestRequest("theobserver/gallery/2013/sep/14/the-10-best-fonts")
    val result = controllers.PublicationController.publishedOn("theobserver/gallery","2013","sep","14","the-10-best-fonts")(testReq)
    status(result) should be(OK)
  }

//  it should "200 when an observer dated section is requested" in {
//    val testReq = TestRequest("theobserver/she-said/2015/may/16")
//    val result = controllers.PublicationController.publishedOn("theobserver/she-said","2015","may","16","")(testReq)
//    status(result) should be(OK)
//  }

  //  val observerBookSectionUrl = "theobserver/2006/mar/05/news/focus"
//  val observerTagCombinerUrl = "theobserver/series/myweek+stage/comedy"
//  val guardianArticleUrl = "theguardian/2012/aug/24/good-to-meet-you-zubair-limbada"
//  val guardianGalleryUrl = "theguardian/gallery/2009/apr/01/prince-harry-william-monarchy"
//  val guardianFeatures = "theguardian/2003/jul/26/features.jobsmoney7"
//  val guardianBookUrl = "theguardian/2015/nov/03/mainsection"
//  val guardianBookSectionUrl = "theguardian/2015/nov/04/g2/features"
//  val guardianTagCombinerUrl = "theguardian/series/from-the-archive+uk/princessmargaret"

}
