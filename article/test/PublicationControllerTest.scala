package test

import controllers.PublicationController
import model.TagDefinition
import org.scalatest.mock.MockitoSugar
import org.mockito.Mockito._
import org.scalatest.{DoNotDiscover, FlatSpec, Matchers}
import play.api.test.Helpers._
import services.{NewspaperBookSectionTagAgent, NewspaperBookTagAgent}

@DoNotDiscover class PublicationControllerTest extends FlatSpec
                                                with Matchers
                                                with ConfiguredTestSuite
                                                with MockitoSugar {

  private val PermanentRedirect = 301
  private val TemporaryRedirect = 302
  private val OK = 200

  val emptySeq: Seq[TagDefinition] = Seq.empty
  val bookAgent = mock[NewspaperBookTagAgent]
  val bookSectionAgent = mock[NewspaperBookSectionTagAgent]
  val publicationController = new PublicationController(bookAgent, bookSectionAgent)

  "Publication Controller" should "redirect to an /all page when an observer dated book url is requested" in {
    when(bookAgent.getTags("theobserver")).thenReturn(Seq(new TagDefinition("Observer Magazine","theobserver/magazine",None,false)))
    when(bookSectionAgent.getTags("theobserver")).thenReturn(emptySeq)
    val testReq = TestRequest("theobserver/2009/may/17/magazine")
    val result = publicationController.publishedOn("theobserver","2009","may","17","magazine")(testReq)
    status(result) should be(PermanentRedirect)
    header("Location",result).getOrElse("") should endWith ("/theobserver/magazine/2009/may/17/all")
  }

  it should "redirect to an /all page when an observer dated book section url is requested" in {
    when(bookAgent.getTags("theobserver")).thenReturn(emptySeq)
    when(bookSectionAgent.getTags("theobserver")).thenReturn(Seq(new TagDefinition("News","theobserver/news/uknews",None,false)))
    val testReq = TestRequest("theobserver/2015/nov/01/news/uknews")
    val result = publicationController.publishedOn("theobserver", "2015", "nov", "01", "news/uknews")(testReq)
    status(result) should be(PermanentRedirect)
    header("Location",result).getOrElse("") should endWith ("/theobserver/news/uknews/2015/nov/01/all")
  }

  it should "200 when an observer article is requested" in {
    when(bookAgent.getTags("theobserver")).thenReturn(emptySeq)
    when(bookSectionAgent.getTags("theobserver")).thenReturn(emptySeq)
    val testReq = TestRequest("theobserver/2014/aug/31/profile-clare-smyth-gordon-ramsay-chef-perfect-ten")
    val result = publicationController.publishedOn("theobserver","2014","aug","31","profile-clare-smyth-gordon-ramsay-chef-perfect-ten")(testReq)
    status(result) should be(OK)
  }

  it should "200 when an observer gallery is requested" in {
    when(bookAgent.getTags("theobserver")).thenReturn(emptySeq)
    when(bookSectionAgent.getTags("theobserver")).thenReturn(emptySeq)
    val testReq = TestRequest("theobserver/gallery/2013/sep/14/the-10-best-fonts")
    val result = publicationController.publishedOn("theobserver/gallery","2013","sep","14","the-10-best-fonts")(testReq)
    status(result) should be(OK)
  }

  it should "200 when an observer dated blog article is requested" in {
    when(bookAgent.getTags("theobserver")).thenReturn(emptySeq)
    when(bookSectionAgent.getTags("theobserver")).thenReturn(emptySeq)
    val testReq = TestRequest("theobserver/she-said/2014/apr/17/unisex-changing-rooms-are-depriving-me-of-getting-naked-with-my-fellow-women")
    val result = publicationController.publishedOn("theobserver/she-said","2014","apr","17","unisex-changing-rooms-are-depriving-me-of-getting-naked-with-my-fellow-women")(testReq)
    status(result) should be(OK)
  }

  it should "redirect to an /all page when a guardian dated newspaper book url is requested" in {
    when(bookAgent.getTags("theguardian")).thenReturn(Seq(new TagDefinition("Main section","theguardian/mainsection",None,false)))
    when(bookSectionAgent.getTags("theguardian")).thenReturn(emptySeq)
    val testReq = TestRequest("theguardian/2015/nov/03/mainsection")
    val result = publicationController.publishedOn("theguardian","2015","nov","03","mainsection")(testReq)
    status(result) should be(PermanentRedirect)
    header("Location",result).getOrElse("") should endWith ("/theguardian/mainsection/2015/nov/03/all")
  }

  it should "redirect to an /all page when a guardian dated newspaper book section url is requested" in {
    when(bookAgent.getTags("theguardian")).thenReturn(emptySeq)
    when(bookSectionAgent.getTags("theguardian")).thenReturn(Seq(new TagDefinition("Comment & features","theguardian/g2/features",None,false)))
    val testReq = TestRequest("theguardian/2015/nov/04/g2/features")
    val result = publicationController.publishedOn("theguardian", "2015", "nov", "04", "g2/features")(testReq)
    status(result) should be(PermanentRedirect)
    header("Location",result).getOrElse("") should endWith ("/theguardian/g2/features/2015/nov/04/all")
  }

  it should "200 when a guardian article is requested" in {
    when(bookAgent.getTags("theguardian")).thenReturn(emptySeq)
    when(bookSectionAgent.getTags("theguardian")).thenReturn(emptySeq)
    val testReq = TestRequest("theguardian/2012/aug/24/good-to-meet-you-zubair-limbada")
    val result = publicationController.publishedOn("theguardian","2012","aug","24","good-to-meet-you-zubair-limbada")(testReq)
    status(result) should be(OK)
  }

  it should "200 when a guardian newspaper book section article is requested" in {
    when(bookAgent.getTags("theguardian")).thenReturn(emptySeq)
    when(bookSectionAgent.getTags("theguardian")).thenReturn(emptySeq)
    val testReq = TestRequest("theguardian/2003/jul/26/features.jobsmoney7")
    val result = publicationController.publishedOn("theguardian","2003","jul","26","features.jobsmoney7")(testReq)
    status(result) should be(OK)
  }

  it should "200 when a guardian gallery is requested" in {
    when(bookAgent.getTags("theguardian")).thenReturn(emptySeq)
    when(bookSectionAgent.getTags("theguardian")).thenReturn(emptySeq)
    val testReq = TestRequest("theguardian/gallery/2009/apr/01/prince-harry-william-monarchy")
    val result = publicationController.publishedOn("theguardian/gallery","2009","apr","01","prince-harry-william-monarchy")(testReq)
    status(result) should be(OK)
  }

  it should "200 when a guardian dated blog article is requested" in {
    when(bookAgent.getTags("theguardian")).thenReturn(emptySeq)
    when(bookSectionAgent.getTags("theguardian")).thenReturn(emptySeq)
    val testReq = TestRequest("theguardian/from-the-archive-blog/2012/feb/17/charlie-chaplin-1952-communist")
    val result = publicationController.publishedOn("theguardian/from-the-archive-blog","2012","feb","17","charlie-chaplin-1952-communist")(testReq)
    status(result) should be(OK)
  }

}
