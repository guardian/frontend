package views.support

import java.time.ZoneOffset
import com.gu.contentapi.client.model.v1.{TagType, Content => ApiContent, Tag => ApiTag}
import com.gu.contentapi.client.utils.CapiModelEnrichment.RichOffsetDateTime
import common.Pagination
import implicits.Dates.jodaToJavaInstant
import model._
import org.joda.time.DateTime
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatestplus.play.guice.GuiceOneAppPerSuite
import play.api.test.FakeRequest

class TitleTest extends AnyFlatSpec with Matchers with GuiceOneAppPerSuite {

  implicit val request = FakeRequest()

  it should "should create a 'default' title" in {
    val page = SimplePage(MetaData.make("", None, "The title", None))
    //without pagination
    Title(page).body should be("The title | The Guardian")

    val withPagination = SimplePage(
      MetaData.make(
        webTitle = "The title",
        section = None,
        id = "",
        pagination = Some(Pagination(7, 50, 300)),
      ),
    )

    //with pagination
    Title(withPagination).body should be("The title | Page 7 of 50 | The Guardian")
  }

  it should "should create a title for Content" in {

    val offsetDate = jodaToJavaInstant(new DateTime()).atOffset(ZoneOffset.UTC)

    val content = ApiContent(
      id = "lifeandstyle/foobar",
      sectionId = Some("lifeandstyle"),
      sectionName = Some("Life & Style"),
      webPublicationDate = Some(offsetDate.toCapiDateTime),
      webTitle = "The title",
      webUrl = "http://www.guardian.co.uk/canonical",
      apiUrl = "http://foo.bar",
      elements = None,
    )

    Title(SimpleContentPage(Content(content)))(FakeRequest("GET", "/sport/foobar")).body should be(
      "The title | Life & Style | The Guardian",
    )
  }

  it should "should create a title for a Tag" in {
    val tag = ApiTag(
      "sport/foobar",
      TagType.Type,
      webTitle = "The title",
      webUrl = "http://foo.bar",
      apiUrl = "http://foo.bar",
      sectionName = Some("Sport"),
    )

    Title(Tag.make(tag))(FakeRequest("GET", "/sport/foobar")).body should be("The title | Sport | The Guardian")

    Title(Tag.make(tag, Some(Pagination(3, 4, 10))))(FakeRequest("GET", "/sport/foobar")).body should be(
      "The title | Page 3 of 4 | Sport | The Guardian",
    )
  }

  it should "should use the section name in the Tag title" in {
    val tag = ApiTag(
      "lifeandstyle/foobar",
      TagType.Type,
      webTitle = "The title",
      webUrl = "http://foo.bar",
      apiUrl = "http://foo.bar",
      sectionName = Some("Life and style"),
    )

    Title(Tag.make(tag))(FakeRequest("GET", "/lifeandstyle/foobar")).body should be(
      "The title | Life and style | The Guardian",
    )

  }

  it should "filter out section if it is the same as webTitle" in {
    val page = SimplePage(
      MetaData.make(
        id = "id",
        webTitle = "The Title",
        section = Some(SectionId.fromId("The title")),
      ),
    )

    Title(page).body should be("The Title | The Guardian")
  }

  it should "keep section if it is not the same as webTitle" in {
    val page = SimplePage(
      MetaData.make(
        id = "id",
        webTitle = "The Title",
        section = Some(SectionId.fromId("The title thing")),
      ),
    )

    Title(page).body should be("The Title | The title thing | The Guardian")
  }

  it should "capitalize the section and not the webTitle" in {
    val page = SimplePage(
      MetaData.make(
        id = "id",
        webTitle = "the title",
        section = Some(SectionId.fromId("the title thing")),
      ),
    )

    Title(page).body should be("the title | The title thing | The Guardian")
  }
}
