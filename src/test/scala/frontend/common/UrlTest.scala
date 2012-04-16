package frontend.common

import org.scalatest.FlatSpec
import org.scalatest.matchers.ShouldMatchers
import com.gu.openplatform.contentapi.model.{ Content => ApiContent }
import org.joda.time.DateTime

class UrlTest extends FlatSpec with ShouldMatchers {

  "Urls" should "be created relative" in {

    val content = ApiContent("foo/2012/jan/07/bar", None, None, new DateTime, "Some article",
      "http://www.guardian.co.uk/foo/2012/jan/07/bar",
      "http://content.guardianapis.com/foo/2012/jan/07/bar")

    RelativeUrl(content) should be("/foo/2012/jan/07/bar")

    Trail(content).url should be("/foo/2012/jan/07/bar")
  }
}
