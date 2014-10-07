package views.support

import model.{FaciaImageElement, Tag, Config, Trail}
import org.joda.time.DateTime
import org.scala_tools.time.Imports
import org.scalatest.{OptionValues, FlatSpec, Matchers}
import com.gu.openplatform.contentapi.model.{Tag => ApiTag}

class ItemKickerTest extends FlatSpec with Matchers with OptionValues {
  def createTrailFixture(showTag: Boolean, showSection: Boolean) = new Trail {

    override def customImageCutout: Option[FaciaImageElement] = None

    override def webPublicationDate: Imports.DateTime = DateTime.now()

    override def url: String = ""

    override def isLive: Boolean = false

    override def section: String = "testsection"

    override def trailText: Option[String] = None

    //sectionId
    override def sectionName: String = "Test Section"

    override def linkText: String = ""

    override def headline: String = ""

    override def webUrl: String = ""

    override def showKickerTag: Boolean = showTag

    override def showKickerSection: Boolean = showSection

    override def tags: Seq[Tag] = Seq(
      Tag(
        ApiTag(
          "testTag",
          "test",
          Some("section"),
          Some("Section"),
          "Test Tag",
          "testtag",
          "testtag"
        )
      )
    )
  }

  "ItemKicker" should "prefer item level tag kicker to collection level section kicker" in {
    ItemKicker.fromTrail(
      createTrailFixture(showTag = true, showSection = false),
      Some(Config("").copy(showSections = true))
    ).value shouldEqual TagKicker("Test Tag", "testtag")
  }

  it should "prefer item level section kicker to collection level tag kicker" in {
    ItemKicker.fromTrail(
      createTrailFixture(showTag = false, showSection = true),
      Some(Config("").copy(showTags = true))
    ).value shouldEqual SectionKicker("Test Section", "/testsection")
  }
}
