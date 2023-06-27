package indexes

import com.gu.contentapi.client.model.v1.{TagType, Tag => ApiTag}
import model.{TagDefinition, TagIndex}
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatest.DoNotDiscover
import test.WithTestExecutionContext
import TagPages._

class TagPagesTest extends AnyFlatSpec with Matchers {

  def tagFixture(webTitle: String): ApiTag =
    ApiTag(
      "id/id",
      TagType.Type,
      None,
      None,
      webTitle,
      "",
      "",
    )

  "alphaIndexKeyFrom alternatives" should "return the downcased first character of an ASCII string" in {
    val words = Seq(
      "monads" -> "m",
      "are" -> "a",
      "cool" -> "c",
      "So" -> "s",
      "Is" -> "i",
      "Rob" -> "r",
    )

    for ((word, char) <- words) {
      alphaIndexKeyFrom(Seq(word)) shouldEqual char
    }
  }

  it should "return the downcased ASCII equivalent of the first letter in a Unicode string, if available" in {
    val words = Seq(
      "á" -> "a",
      "č" -> "c",
      "ž" -> "z",
      "ý" -> "y",
      "Á" -> "a",
      "Ò" -> "o",
      "Ù" -> "u",
    )

    for ((unicode, ascii) <- words) {
      alphaIndexKeyFrom(Seq(unicode)) shouldEqual ascii
    }
  }

  it should "index as 'numeric' if the first character is a digit" in {
    val fixtures = Seq(
      "100 Years of Solitude",
      "1984",
      "20,000 Leagues Under the Sea",
      "0 hero: a very special number",
    )

    for (fixture <- fixtures) {
      alphaIndexKeyFrom(Seq(fixture)) shouldEqual "1-9"
    }
  }

  it should "pick the first index key that has a suitable character" in {
    alphaIndexKeyFrom(Seq("", "£££", "  !Be Cool!", "yes")) shouldEqual "b"
  }

  "alphaIndexKeyFromContributorFields" should "not crash if a tag has no last name or first name" in {
    alphaIndexKeyFromContributorFields(
      tagFixture("Good web title").copy(firstName = None, lastName = None),
    ) shouldEqual "g"
  }

  it should "prefer last name if available" in {
    alphaIndexKeyFromContributorFields(
      tagFixture("Who dis?").copy(firstName = Some("Roberto"), lastName = Some("Tyley")),
    ) shouldEqual "t"
  }

  it should "use first name if last name unavailable" in {
    alphaIndexKeyFromContributorFields(
      tagFixture("Queen Bey").copy(firstName = Some("Beyoncé"), lastName = None),
    ) shouldEqual "b"
  }

  "byWebTitle" should "convert a collection of tags into map of TagPages keyed by alpha-index-key" in {
    val activateTag = tagFixture("Activate")
    val archivedSpeakersTag = tagFixture("Archived speakers")
    val blogTag = tagFixture("Blog")
    val advertisingTag = tagFixture("Advertising")
    val otherDigitalSolutionsTag = tagFixture("Other digital solutions")

    val tags = Set(activateTag, archivedSpeakersTag, blogTag, advertisingTag, otherDigitalSolutionsTag)

    toPages(TagPages.byWebTitle(tags))(_.toUpperCase, TagPages.asciiLowerWebTitle) shouldEqual Seq(
      TagIndex(
        "a",
        "A",
        List(
          activateTag,
          advertisingTag,
          archivedSpeakersTag,
        ).map(TagDefinition.fromContentApiTag),
      ),
      TagIndex(
        "b",
        "B",
        List(
          TagDefinition.fromContentApiTag(blogTag),
        ),
      ),
      TagIndex(
        "o",
        "O",
        List(
          TagDefinition.fromContentApiTag(otherDigitalSolutionsTag),
        ),
      ),
    )
  }
}
