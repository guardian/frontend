package model

import com.gu.contentapi.client.model.{ Content => ApiContent, Tag => ApiTag }
import org.joda.time.DateTime
import org.scalatest.FlatSpec
import org.scalatest.Matchers
import play.api.Play

class UrlsTest extends FlatSpec with Matchers {

  Play.unsafeApplication

  "Urls" should "be created relative for articles" in {

    val content = ApiContent("foo/2012/jan/07/bar", None, None, Some(new DateTime), "Some article",
      "http://www.guardian.co.uk/foo/2012/jan/07/bar",
      "http://content.guardianapis.com/foo/2012/jan/07/bar",
      tags = List(tag("type/article")),
      elements = None
    )

    SupportedUrl(content) should be("/foo/2012/jan/07/bar")

    Content(content).url should be("/foo/2012/jan/07/bar")
  }

  they should "be created relative for galleries" in {

    val content = ApiContent("foo/gallery/2012/jan/07/bar", None, None, Some(new DateTime), "Some article",
      "http://www.guardian.co.uk/foo/gallery/2012/jan/07/bar",
      "http://content.guardianapis.com/foo/gallery/2012/jan/07/bar",
      tags = List(tag("type/gallery")),
      elements = None
    )

    SupportedUrl(content) should be("/foo/gallery/2012/jan/07/bar")

    Content(content).url should be("/foo/gallery/2012/jan/07/bar")
  }

  they should "be created relative for tags" in {
    Tag(tag("foo/bar")).url should be("/foo/bar")
  }

  private def tag(id: String, name: String = "") = ApiTag(
    id = id, `type` = "type", webTitle = name, webUrl = "", apiUrl = ""
  )
}
