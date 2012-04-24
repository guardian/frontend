package common

import org.scalatest.FlatSpec
import org.scalatest.matchers.ShouldMatchers
import org.joda.time.DateTime
import com.gu.openplatform.contentapi.model.{ Content => ApiContent, Tag => ApiTag }
import play.api.Play

class UrlTest extends FlatSpec with ShouldMatchers {

  Play.unsafeApplication

  val they = it

  "Urls" should "be created relative for supported content types" in {

    val content = ApiContent("foo/2012/jan/07/bar", None, None, new DateTime, "Some article",
      "http://www.guardian.co.uk/foo/2012/jan/07/bar",
      "http://content.guardianapis.com/foo/2012/jan/07/bar",
      tags = List(tagWithId("type/article"))
    )

    SupportedUrl(content) should be("/foo/2012/jan/07/bar")

    new Content(content).url should be("/foo/2012/jan/07/bar")
  }

  they should "be created absolute for unsupported content types" in {

    val content = ApiContent("foo/2012/jan/07/bar", None, None, new DateTime, "Some article",
      "http://www.guardian.co.uk/foo/2012/jan/07/bar",
      "http://content.guardianapis.com/foo/2012/jan/07/bar",
      tags = List(tagWithId("type/interactive"))
    )

    SupportedUrl(content) should be("http://www.guardian.co.uk/foo/2012/jan/07/bar")

    new Content(content).url should be("http://www.guardian.co.uk/foo/2012/jan/07/bar")
  }

  they should "be created relative for tags" in {
    Tag(tagWithId("foo/bar")).url should be("/foo/bar")
  }

  private def tagWithId(id: String) = ApiTag(id = id, `type` = "type", webTitle = "", webUrl = "", apiUrl = "")
}
