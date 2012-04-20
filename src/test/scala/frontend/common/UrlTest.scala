package frontend.common

import org.scalatest.FlatSpec
import org.scalatest.matchers.ShouldMatchers
import org.joda.time.DateTime
import com.gu.openplatform.contentapi.model.{ Content => ApiContent }

class UrlTest extends FlatSpec with ShouldMatchers {

  "Urls" should "be created relative" in {

    val content = ApiContent("foo/2012/jan/07/bar", None, None, new DateTime, "Some article",
      "http://www.guardian.co.uk/foo/2012/jan/07/bar",
      "http://content.guardianapis.com/foo/2012/jan/07/bar")

    RelativeUrl(content) should be("/foo/2012/jan/07/bar")

    new Content(content).url should be("/foo/2012/jan/07/bar")
  }
}
