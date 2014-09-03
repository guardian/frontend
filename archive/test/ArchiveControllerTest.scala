package test

import play.api.test.Helpers._
import org.scalatest.Matchers
import org.scalatest.FlatSpec

class ArchiveControllerTest extends FlatSpec with Matchers {

  it should "return a normalised r1 path" in Fake {
    val tests = Map[String, Option[String]](
      "www.theguardian.com/books/reviews/travel/0,,343395,00.html" -> Some("www.theguardian.com/books/reviews/travel/0,,343395,.html"),
      "www.theguardian.com/books/reviews/travel/0,,343395,.html" -> Some("www.theguardian.com/books/reviews/travel/0,,343395,.html"),
      "www.theguardian.com/books/review/story/0,034,908973,00.html" -> Some("www.theguardian.com/books/review/story/0,,908973,.html"),
      "www.theguardian.com/books/reviews/travel/foo" -> None
    ) 
    tests foreach {
      case (key, value) => controllers.ArchiveController.normalise(key) should be (value)
    }
  }
  
  // r1 curio (all the redirects have their 00's removed, all the s3 archived files don't)
  it should "return a normalised r1 path with suffixed zeros" in Fake {
    val path = "www.theguardian.com/books/reviews/travel/0,,343395,.html"
    val expectedPath = Some("www.theguardian.com/books/reviews/travel/0,,343395,00.html")
    controllers.ArchiveController.normalise(path , zeros = "00") should be (expectedPath)
  }
  
  it should "decode encoded urls" in Fake {
    val result = controllers.ArchiveController.lookup("www.theguardian.com/foo%2Cfoo")(TestRequest())
    status(result) should be (301)
    header("Location", result).head should be ("http://www.theguardian.com/foo,foo")
  }

  it should "decode encoded spaces as + for tag combiners" in Fake {
    val result = controllers.ArchiveController.lookup("www.theguardian.com/foo%20foo")(TestRequest())
    status(result) should be (301)
    header("Location", result).head should be ("http://www.theguardian.com/foo+foo")
  }

  it should "redirect old style galleries" in Fake {
    val result = controllers.ArchiveController.lookup("www.theguardian.com/arts/gallery/0,")(TestRequest())
    status(result) should be (301)
    header("Location", result).head should be ("http://www.theguardian.com/arts/pictures/0,")
  }

  it should "test a redirect doesn't not link to itself" in Fake {
    val path = "www.theguardian.com/books/worldliteraturetour/page/0,,2021886,.html"
    val dest = "http://books.theguardian.com/worldliteraturetour/page/0,,2021886,.html"
    controllers.ArchiveController.linksToItself(path, dest) should be (true)
  }

  it should "lowercase the section of the url" in Fake {
    val result = controllers.ArchiveController.lookup("www.theguardian.com/Football/News_Story/0,1563,1655638,00.html")(TestRequest())
    status(result) should be (301)
    header("Location", result).head should be ("http://www.theguardian.com/football/News_Story/0,1563,1655638,00.html")
  }

  it should "redirect century urls correctly" in Fake {
    val result = controllers.ArchiveController.lookup("www.theguardian.com/century")(TestRequest())
    status(result) should be (301)
    header("Location", result).head should be ("http://www.theguardian.com/world/2014/jul/31/-sp-how-the-guardian-covered-the-20th-century")
  }

  it should "redirect century decade urls correctly" in Fake {
    val result = controllers.ArchiveController.lookup("www.theguardian.com/1899-1909")(TestRequest())
    status(result) should be (301)
    header("Location", result).head should be ("http://www.theguardian.com/world/2014/jul/31/-sp-how-the-guardian-covered-the-20th-century")
  }

  it should "redirect an R1 century article to a corrected decade story endpoint" in Fake {
    val result = controllers.ArchiveController.lookup("www.theguardian.com/1899-1909/Story/0,,126404,00.html")(TestRequest())
    status(result) should be (301)
    header("Location", result).head should be ("http://www.theguardian.com/century/1899-1909/Story/0,,126404,00.html")
  }

  it should "not redirect a random URL that contains the word century" in Fake {
    val result = controllers.ArchiveController.lookup("www.theguardian.com/discover-culture/2014/jul/22/mid-century-textiles-then-and-now")(TestRequest())
    status(result) should be (404)
  }
}
