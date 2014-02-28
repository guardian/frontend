package test

import play.api.test._
import play.api.test.Helpers._
import org.scalatest.Matchers
import org.scalatest.FlatSpec

class ArchiveControllerTest extends FlatSpec with Matchers {
  
  /*
   
  "Archive Controller" should "return a HTTP 303 when it finds a match in DynamoDB" in Fake {
    val url = "www.theguardian.com/media/emailservices/article/0,,1694396,.html"
    val result = controllers.ArchiveController.lookup(url)(TestRequest())
    header("Location", result) should be(Some("http://www.theguardian.com/media/2006/jan/25/1"))
    status(result) should be(301)
  }
  
  it should "return a HTTP 200 when it finds a resource in S3" in Fake {
    val url = "www.theguardian.com/travel/askatraveller/0,,345059,00.html"
    val result = controllers.ArchiveController.lookup(url)(TestRequest())
    status(result) should be(200)
    contentType(result) should be(Some("text/html"))
  }

  it should "return a HTTP 404 when it can not find a resource" in Fake {
    val url = "www.theguardian.com/i/am/not/here"
    val result = controllers.ArchiveController.lookup(url)(TestRequest())
    status(result) should be(404)
  }

  it should "fetch the HTML of a valid archived URL" in Fake {
    val result = controllers.ArchiveController.isArchived("www.theguardian.com/travel/askatraveller/0,,345059,00.html")
    result.get should include ("<title>Ask a traveller | guardian.co.uk Travel</title>")
  }
  
  it should "return None for a invalid archive URL" in Fake {
    val result = controllers.ArchiveController.isArchived("not/here")
    result should be(None)
  }
  
  it should "fetch the destination of a valid redirected URL" in Fake {
    val result = controllers.ArchiveController.isRedirect("www.theguardian.com/media/emailservices/article/0,,1694396,.html")
    result should be (Some("http://www.theguardian.com/media/2006/jan/25/1"))
  }
  
  it should "return None for a path that has not been redirected" in Fake {
    val result = controllers.ArchiveController.isRedirect("not/here")
    result should be(None)
  }
  */

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

  if should
  "http://www.theguardian.com/books/worldliteraturetour/page/0,,2021886,.html"
  "http://books.theguardian.com/worldliteraturetour/page/0,,2021886,.html"


}
