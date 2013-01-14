package common

import org.scalatest.FlatSpec
import org.scalatest.matchers.ShouldMatchers
import play.api.Play
import InBodyLink.unSupportedContentTypes

class InBodyLinkTest extends FlatSpec with ShouldMatchers {

  Play.unsafeApplication

  val realUrls = Seq(

    //----------  Supported types ----------//

    //tags
    ("http://www.guardian.co.uk/sport/olympics-2012", "/sport/olympics-2012"),
    ("http://www.guardiannews.com/sport/olympics-2012", "/sport/olympics-2012"),

    //series, blogs, book sections, other 3 part urls
    ("http://www.guardian.co.uk/football/series/thefiver", "/football/series/thefiver"),
    ("http://www.guardiannews.com/football/series/thefiver", "/football/series/thefiver"),

    //section
    ("http://www.guardian.co.uk/sport", "/sport"),
    ("http://www.guardiannews.com/lifeandstyle", "/lifeandstyle"),

    //gallery
    ("http://www.guardian.co.uk/news/gallery/2012/jun/07/picture-desk-live-gallery",
      "/news/gallery/2012/jun/07/picture-desk-live-gallery"),
    ("http://www.guardiannews.com/news/gallery/2012/jun/07/picture-desk-live-gallery",
      "/news/gallery/2012/jun/07/picture-desk-live-gallery"),
    ("http://www.guardian.co.uk/technology/gamesblog/gallery/2012/jun/01/e3-2012-10-most-anticipated-games",
      "/technology/gamesblog/gallery/2012/jun/01/e3-2012-10-most-anticipated-games"),
    ("http://www.guardiannews.com/technology/gamesblog/gallery/2012/jun/01/e3-2012-10-most-anticipated-games",
      "/technology/gamesblog/gallery/2012/jun/01/e3-2012-10-most-anticipated-games"),

    //article
    ("http://www.guardian.co.uk/football/blog/2012/jun/07/euro-2012-live-blog",
      "/football/blog/2012/jun/07/euro-2012-live-blog"),
    ("http://www.guardiannews.com/football/blog/2012/jun/07/euro-2012-live-blog",
      "/football/blog/2012/jun/07/euro-2012-live-blog"),
    ("http://www.guardian.co.uk/politics/2012/jun/07/politics-live-readers-edition-7-june",
      "/politics/2012/jun/07/politics-live-readers-edition-7-june"),
    ("http://www.guardiannews.com/politics/2012/jun/07/politics-live-readers-edition-7-june",
      "/politics/2012/jun/07/politics-live-readers-edition-7-june"),

    //dot in words for url
    ("http://www.guardian.co.uk/football/blog/2012/jun/07/euro.2012.live.blog",
      "/football/blog/2012/jun/07/euro.2012.live.blog"),

    //query params
    ("http://www.guardiannews.com/politics/2012/jun/07/politics-live-readers-edition-7-june?foo=bar",
      "/politics/2012/jun/07/politics-live-readers-edition-7-june?foo=bar"),

    //# in url
    ("http://www.guardiannews.com/politics/2012/jun/07/politics-live-readers-edition-7-june#1234",
      "/politics/2012/jun/07/politics-live-readers-edition-7-june#1234"),

    //----------  UnSupported types ----------//

    //external urls
    ("http://www.google.com", "http://www.google.com"),

    //interactives
    ("http://www.guardian.co.uk/news/datablog/interactive/2012/jun/07/iraq-afghanistan-coverage-interactive-timeline",
      "http://www.guardian.co.uk/news/datablog/interactive/2012/jun/07/iraq-afghanistan-coverage-interactive-timeline"),
    ("http://www.guardiannews.com/news/datablog/interactive/2012/jun/07/iraq-afghanistan-coverage-interactive-timeline",
      "http://www.guardiannews.com/news/datablog/interactive/2012/jun/07/iraq-afghanistan-coverage-interactive-timeline")
  )

  "InBodyLink" should "understand which urls we support" in {
    realUrls foreach {
      case (originalUrl, expectedUrl) => InBodyLink(originalUrl) should be(expectedUrl)

    }
  }

  it should "not resolve unsupported content" in {
    val urls = unSupportedContentTypes flatMap { contentType =>
      Seq(
        "http://www.guardian.co.uk/section/" + contentType + "/2011/jan/01/words-for-url",
        "http://www.guardian.co.uk/section/blog/" + contentType + "/2011/jan/01/words-for-url",
        "http://www.guardiannews.com/section/" + contentType + "/2011/jan/01/words-for-url",
        "http://www.guardiannews.com/section/blog/" + contentType + "/2011/jan/01/words-for-url"
      )
    }
    urls foreach { url => InBodyLink(url) should be(url) }
  }

  it should "not resolve direct comment links" in {

    InBodyLink("http://www.guardian.co.uk/discussion/comment-permalink/19452022") should
      be("http://www.guardian.co.uk/discussion/comment-permalink/19452022")

  }

  it should "not resolve feed articles" in {
    InBodyLink("http://www.guardian.co.uk/football/feedarticle/10541078") should
      be("http://www.guardian.co.uk/football/feedarticle/10541078")
  }

  it should "not resolve comment links" in {
    InBodyLink("http://www.guardian.co.uk/commentisfree/2013/jan/13/obama-foreign-policy-lessons-iraq?mobile-redirect=false#comment-20590999") should
      be("http://www.guardian.co.uk/commentisfree/2013/jan/13/obama-foreign-policy-lessons-iraq?mobile-redirect=false#comment-20590999")
  }
}
