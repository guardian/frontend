package indexes

import com.gu.contentapi.client.model.v1.{TagType, Tag => ApiTag}
import model.{TagDefinition, TagIndex}
import org.scalatest.concurrent.PatienceConfiguration.Timeout
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatest.DoNotDiscover
import play.api.libs.iteratee.Enumerator
import test.WithTestExecutionContext

import scala.language.postfixOps
import scala.concurrent.duration._

@DoNotDiscover class TagPagesTest extends AnyFlatSpec with Matchers with WithTestExecutionContext with ScalaFutures {

  val tagPages = new TagPages

  "alphaIndexKey" should "return the downcased first character of an ASCII string" in {
    val words = Seq(
      "monads" -> "m",
      "are" -> "a",
      "cool" -> "c",
      "So" -> "s",
      "Is" -> "i",
      "Rob" -> "r",
    )

    for ((word, char) <- words) {
      tagPages.alphaIndexKey(word) shouldEqual char
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
      tagPages.alphaIndexKey(unicode) shouldEqual ascii
    }
  }

  it should "index by 0-9 if the first character is a digit" in {
    val fixtures = Seq(
      "100 Years of Solitude",
      "1984",
      "20,000 Leagues Under the Sea",
    )

    for (fixture <- fixtures) {
      tagPages.alphaIndexKey(fixture) shouldEqual "1-9"
    }
  }

  "byWebTitle" should "convert an enumerator of tags into a Future of alpha-ordered TagPages" in {
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

    val activateTag = tagFixture("Activate")
    val archivedSpeakersTag = tagFixture("Archived speakers")
    val blogTag = tagFixture("Blog")
    val advertisingTag = tagFixture("Advertising")
    val otherDigitalSolutionsTag = tagFixture("Other digital solutions")

    tagPages.toPages(
      Enumerator(
        activateTag,
        archivedSpeakersTag,
        blogTag,
        advertisingTag,
        otherDigitalSolutionsTag,
      ).run(tagPages.byWebTitle).futureValue(Timeout(1 second)),
    )(_.toUpperCase, tagPages.asciiLowerWebTitle) shouldEqual Seq(
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
