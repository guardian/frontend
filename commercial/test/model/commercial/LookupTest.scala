package model.commercial

import org.scalatest.{FlatSpec, Matchers}
import test.Fake

import scala.concurrent.Await
import scala.concurrent.duration._

class LookupTest extends FlatSpec with Matchers {

  private def contentsOf(shortUrls: String*) = {
    val futureContents = Lookup.contentByShortUrls(shortUrls)
    Await.result(futureContents, 10.seconds)
  }

  "contentByShortUrls" should "find content for genuine URLs" in Fake {
    val contents = contentsOf("http://gu.com/p/3qeqm", "http://gu.com/p/4v86p", "http://gu.com/p/4vf6t")
    contents.map(_.webTitle) should be(Seq(
      "Wikipedia: meet the man who has edited 3m articles",
      "A book for the beach: In the Woods by Tana French",
      "Norway minister threatens to deport Eritrean migrants"
    ))
  }

  "contentByShortUrls" should "not find content for fake URLs" in Fake {
    contentsOf("http://gu.com/p/3qeqmjlkk", "http://gu.com/p/4gfshstv86p") should be(Nil)
  }

  "contentByShortUrls" should "not find content for badly-formed URLs" in Fake {
    contentsOf("abc", "def") should be(Nil)
  }

  "contentByShortUrls" should "not find content for empty seq of URLs" in {
    contentsOf() should be(Nil)
  }
}
