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
    Title(page).body should be ("The title | The Guardian")

    val withPagination = new MetaData() {
      override def analyticsName = ""
      override def webTitle = "The title"
      override def section = ""
      override def id = ""
      override def pagination = Some(Pagination(7, 50, 300))
    }

    //with pagination
    Title(withPagination).body should be ("The title | Page 7 of 50 | The Guardian")
  }

  it should "should create a title for Content" in {
    val content = ApiContent("lifeandstyle/foobar", Some("lifeandstyle"), Some("Life & Style"), Some(new DateTime()),
      "The title", "http://www.guardian.co.uk/canonical", "http://foo.bar", elements = None)

    Title(Content(content))(FakeRequest("GET", "/sport/foobar")).body should be ("The title | Lifeandstyle | The Guardian")
  }

  it should "should create a title for a Tag" in {
    val tag = new ApiTag("sport/foobar", "type", webTitle = "The title", webUrl = "http://foo.bar",
      apiUrl = "http://foo.bar", sectionId = Some("sport"))

    Title(Tag(tag))(FakeRequest("GET", "/sport/foobar")).body should be ("The title | Sport | The Guardian")

    Title(Tag(tag, Some(Pagination(3, 4, 10))))(FakeRequest("GET", "/sport/foobar")).body should be ("The title | Page 3 of 4 | Sport | The Guardian")
  }

  it should "filter out section if it is the same as webTitle" in {
    val page = Page(id="id", webTitle="The Title", section="The title", analyticsName="")

    Title(page).body should be ("The Title | The Guardian")
  }

  it should "keep section if it is not the same as webTitle" in {
    val page = Page(id="id", webTitle="The Title", section="The title thing", analyticsName="")

    Title(page).body should be ("The Title | The title thing | The Guardian")
  }

  it should "capitalize the section and not the webTitle" in {
    val page = Page(id="id", webTitle="the title", section="the title thing", analyticsName="")

    Title(page).body should be ("the title | The title thing | The Guardian")
  }
}
