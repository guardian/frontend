package views.support

import com.gu.openplatform.contentapi.model.{ Tag => ApiTag }
import model._
import org.scalatest.FlatSpec
import org.scalatest.matchers.ShouldMatchers

class TagLinksTest extends FlatSpec with ShouldMatchers {

  "TagLinks" should "link to tags" in {
    val tags = Seq(Tag(tag("profile/john-smith", "John Smith")), Tag(tag("profile/joesoap", "Joe Soap")))

    TagLinks("John Smith and Joe Soap and John Smith Again", tags).text should
      equal("""<a href="/profile/john-smith" data-link-name="auto tag link">John Smith</a> and <a href="/profile/joesoap" data-link-name="auto tag link">Joe Soap</a> and John Smith Again""")
  }

  private def tag(id: String, name: String = "") = ApiTag(
    id = id, `type` = "type", webTitle = name, webUrl = "", apiUrl = ""
  )
}
