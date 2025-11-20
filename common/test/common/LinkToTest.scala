package common

import org.scalatest.matchers.should.Matchers
import common.editions.{Au, Europe, International, Uk, Us}
import org.scalatest.flatspec.AnyFlatSpec
import play.api.mvc.AnyContentAsEmpty
import test._
import play.api.test.FakeRequest

class LinkToTest extends AnyFlatSpec with Matchers with implicits.FakeRequests {

  implicit val edition: Uk.type = Uk
  implicit val editions: Seq[Edition] = Seq(Uk, Us, Au)
  implicit val request: FakeRequest[AnyContentAsEmpty.type] = FakeRequest("GET", "/")

  object TestLinkTo extends LinkTo {
    override lazy val host = "http://www.foo.com"
  }

  object TheGuardianLinkTo extends LinkTo {
    override lazy val host = "https://www.theguardian.com"
  }

  object TestAmpLinkTo extends AmpLinkTo {
    override lazy val host = "https://amp.theguardian.com"
  }

  "LinkTo" should "leave 'other' urls unchanged" in {
    val otherUrl = "http://somewhere.com/foo/bar.html?age=7#TOP"
    TestLinkTo(otherUrl, edition) should be(otherUrl)
  }

  it should "modify the host of Guardian urls" in {
    TestLinkTo("http://www.theguardian.com/foo/bar.html?age=7#TOP", edition) should be(
      "http://www.foo.com/foo/bar.html?age=7#TOP",
    )
  }

  it should "editionalise the front url" in {
    TestLinkTo("http://www.theguardian.com", edition) should be("http://www.foo.com/uk")
  }

  it should "editionalise the front path" in {
    TestLinkTo("/", edition) should be("http://www.foo.com/uk")
  }

  it should "not modify protocol relative paths" in {
    TestLinkTo("//www.youtube.com/embed/jLoG-fNir0c?enablejsapi=1&version=3", edition) should be(
      "//www.youtube.com/embed/jLoG-fNir0c?enablejsapi=1&version=3",
    )
  }

  it should "strip leading and trailing whitespace" in {
    TestLinkTo("  http://www.foo.com/uk   ", edition) should be("http://www.foo.com/uk")
  }

  it should "link to section and not the 'section tag'" in {
    TestLinkTo("http://www.theguardian.com/books/books", edition) should be("http://www.foo.com/books")
    TestLinkTo("/books/books", edition) should be("http://www.foo.com/books")
    TestLinkTo("/books-23-f/books-23-f", edition) should be("http://www.foo.com/books-23-f")
  }

  it should "generate an editionalised RSS path" in {
    // editionalised
    TestLinkTo("/commentisfree/rss", edition) should be("http://www.foo.com/uk/commentisfree/rss")
    TestLinkTo("/rss", edition) should be("http://www.foo.com/uk/rss")
    // not editionalised
    TestLinkTo("/football/rss", edition) should be("http://www.foo.com/football/rss")
  }

  it should "always write interactives as https links" in {
    val interactives = Seq(
      "www.theguardian.com/women-in-leadership/ng-interactive/2014/feb/28/star-women-leading-ladies-behind-scenes-film-interactive",
      "www.theguardian.com/observer-food-monthly-awards/ng-interactive/2016/may/15/observer-food-monthly-awards-your-chance-to-vote",
      "www.theguardian.com/lifeandstyle/ng-interactive/2016/jun/22/will-brexit-take-the-nhs-to-breaking-point-cartoon",
    )
    for (interactive <- interactives) {
      TheGuardianLinkTo("https://" + interactive) should be("https://" + interactive)
      TheGuardianLinkTo("http://" + interactive) should be("https://" + interactive)
    }
  }

  it should "be https to amp" in {
    TestAmpLinkTo("/law/2015/oct/08/jeremy-corbyn-rejects-formal-privy-council-induction-by-queen", edition) should be(
      "https://amp.theguardian.com/law/2015/oct/08/jeremy-corbyn-rejects-formal-privy-council-induction-by-queen",
    )
  }

  it should "correctly editionalise the International front" in {
    TheGuardianLinkTo("/", International) should be("https://www.theguardian.com/international")
  }

  it should "correctly editionalise the Europe front" in {
    TheGuardianLinkTo("/", Europe) should be("https://www.theguardian.com/europe")
  }

  it should "correctly link editionalised sections" in {
    for (edition <- editions) {
      for (section <- edition.editionalisedSections) {
        val testLink = TheGuardianLinkTo(s"http://www.theguardian.com/$section", edition)
        val expectedPath = if (section.isEmpty) edition.networkFrontId else s"${edition.networkFrontId}/$section"
        testLink should startWith("https://")
        testLink should endWith(s"www.theguardian.com/$expectedPath")
      }
    }
  }

  it should "correctly link editionalised sections to the UK version for the International edition" in {
    // Only the front page is different in the international edition, the others go to UK...
    for (section <- International.editionalisedSections.filterNot(_.isEmpty)) {
      TheGuardianLinkTo(s"/$section", International) should endWith(s"www.theguardian.com/uk/$section")
    }
  }

  it should "correctly link editionalised sections to the UK version for the Europe edition" in {
    // Only the front page is different in the europe edition, the others go to UK...
    for (section <- Europe.editionalisedSections.filterNot(_.isEmpty)) {
      TheGuardianLinkTo(s"/$section", Europe) should endWith(s"www.theguardian.com/uk/$section")
    }
  }

  it should "correctly editionalise thefilter uk" in {
    TheGuardianLinkTo("/thefilter", Uk) should endWith(s"www.theguardian.com/uk/thefilter")
  }

  it should "correctly editionalise thefilter europe" in {
    TheGuardianLinkTo("/thefilter", Europe) should endWith(s"www.theguardian.com/uk/thefilter")
  }

  it should "correctly editionalise thefilter US to point to us/thefilter" in {
    TheGuardianLinkTo("/thefilter", Us) should endWith(s"www.theguardian.com/us/thefilter")
  }

  object TestCanonicalLink extends CanonicalLink

  "CanonicalLink" should "be the gatekeeper for significant parameters" in {
    /*

    If you are reading this you have probably added a new parameter to the application.
    Before doing this you need to understand the implications this has on caching and SEO.

    This is not to stop you adding parameters, it is here to make you think before doing so.

    Please read and understand the following...

    http://support.google.com/webmasters/bin/answer.py?hl=en&answer=1235687

    Make sure you have done everything necessary before releasing a new parameter.

    Make sure you have discussed what you want to do with the team.

    You might need to modify the CDN to accept your new parameter.

     */

    TestCanonicalLink.significantParams should be(Seq("index", "page", "filterKeyEvents"))

  }

  it should "create a simple canonical url" in {
    TestCanonicalLink(TestRequest("/foo").withHost("www.somewhere.com"), "http://www.somewhere.com/foo") should be(
      "http://www.somewhere.com/foo",
    )
  }

  it should "ignore insignificant params" in {
    TestCanonicalLink(
      TestRequest("/foo?view=mobile").withHost("www.somewhere.com"),
      "http://www.somewhere.com/foo",
    ) should be("http://www.somewhere.com/foo")
  }

  it should "include significant params" in {
    TestCanonicalLink(
      TestRequest("/foo?page=3").withHost("www.somewhere.com"),
      "http://www.somewhere.com/foo",
    ) should be("http://www.somewhere.com/foo?page=3")
    TestCanonicalLink(
      TestRequest("/foo?index=2").withHost("www.somewhere.com"),
      "http://www.somewhere.com/foo",
    ) should be("http://www.somewhere.com/foo?index=2")
    TestCanonicalLink(
      TestRequest("/foo?page=3&index=1").withHost("www.somewhere.com"),
      "http://www.somewhere.com/foo",
    ) should be("http://www.somewhere.com/foo?index=1&page=3")
    TestCanonicalLink(
      TestRequest("/foo?page=3&random=55&index=1").withHost("www.somewhere.com"),
      "http://www.somewhere.com/foo",
    ) should be("http://www.somewhere.com/foo?index=1&page=3")
  }

  it should "escape params" in {
    TestCanonicalLink(
      TestRequest("/foo?page=http://www.theguardian.com").withHost("www.somewhere.com"),
      "http://www.somewhere.com/foo",
    ) should be("http://www.somewhere.com/foo?page=http%3A%2F%2Fwww.theguardian.com")
  }

  it should "link to http explicitly for amp articles" in {
    val result = TestCanonicalLink(
      TestRequest("/law/2015/oct/08/jeremy-corbyn-rejects-formal-privy-council-induction-by-queen/amp")
        .withHost("www.theguardian.com"),
      "http://www.theguardian.com/law/2015/oct/08/jeremy-corbyn-rejects-formal-privy-council-induction-by-queen",
    )
    result should be(
      "http://www.theguardian.com/law/2015/oct/08/jeremy-corbyn-rejects-formal-privy-council-induction-by-queen",
    )
  }

  it should "link to https for all paths and editions" in {
    val result = TestCanonicalLink(
      TestRequest("/uk/technology").withHost("http://www.theguardian.com").withHeaders("X-Gu-Edition" -> Us.id),
      "https://www.theguardian.com/uk/technology",
    )
    result should be("https://www.theguardian.com/uk/technology")
  }

}
