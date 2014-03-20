package views.support

import org.scalatest.{Matchers, FlatSpec}
import model.{Tag, MetaData, Content, Page}
import play.api.test.FakeRequest
import common.Pagination
import com.gu.openplatform.contentapi.model.{Content => ApiContent, Tag => ApiTag}
import org.joda.time.DateTime

class TitleTest extends FlatSpec with Matchers {

  implicit val request = FakeRequest()

  it should "should create a 'default' title" in {
    val page = Page("", "", "The title", "", None)
    //without pagination
    Title(page).body should be ("The title | theguardian.com")

    val withPagination = new MetaData() {
      override def analyticsName = ""
      override def webTitle = "The title"
      override def section = ""
      override def id = ""
      override def pagination = Some(Pagination(7, 50, 300))
    }

    //with pagination
    Title(withPagination).body should be ("The title | theguardian.com | Page 7 of 50")
  }

  it should "should create a title for Content" in {
    val content = ApiContent("lifeandstyle/foobar", Some("lifeandstyle"), Some("Life & Style"), new DateTime(),
      "The title", "http://www.guardian.co.uk/canonical", "http://foo.bar", elements = None)

    Title(Content(content))(FakeRequest("GET", "/sport/foobar")).body should be ("The title | life | theguardian.com")
  }

  it should "should create a title for a Tag" in {
    val tag = new ApiTag("sport/foobar", "type", webTitle = "The title", webUrl = "http://foo.bar",
      apiUrl = "http://foo.bar", sectionId = Some("sport"))

    Title(Tag(tag))(FakeRequest("GET", "/sport/foobar")).body should be ("The title | sport | theguardian.com")

    Title(Tag(tag, Some(Pagination(3, 4, 10))))(FakeRequest("GET", "/sport/foobar")).body should be ("The title | sport | theguardian.com | Page 3 of 4")
  }
}
