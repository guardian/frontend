package test

import play.api.test._
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
    val tests = Map[String, Option[String]](
      "www.theguardian.com/books/reviews/travel/0,,343395,00.html" -> Some("www.theguardian.com/books/reviews/travel/0,,343395,00.html")
    ) 
    tests foreach {
      case (key, value) => controllers.ArchiveController.normalise(key, zeros = "00") should be (value)
    }
  }
  
  it should "test a string is url encoded" in Fake {
    controllers.ArchiveController.isEncoded("foo%2Cfoo") should be (Some("foo,foo"))
    controllers.ArchiveController.isEncoded("foo") should be (None)
  }

  it should "test a string contains an old gallery" in Fake {
    controllers.ArchiveController.isGallery("arts/gallery/0,") should be (Some("arts/pictures/0,"))
  }

  it should "test a redirect doesn't not link to itself" in Fake {
    val path = "www.theguardian.com/books/worldliteraturetour/page/0,,2021886,.html"
    val dest = "http://books.theguardian.com/worldliteraturetour/page/0,,2021886,.html"
    controllers.ArchiveController.linksToItself(path, dest) should be (true)
  }

  it should "lowercase the section of the url" in Fake {

    val location = controllers.ArchiveController.lowercase("www.theguardian.com/Football/News_Story/0,1563,1655638,00.html").head.header.headers("Location")
    location should be ("http://www.theguardian.com/football/News_Story/0,1563,1655638,00.html")
  }

}
