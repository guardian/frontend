package indexes

import com.gu.contentapi.client.model.v1.{Tag => ApiTag, TagType}
import model.{TagDefinition, TagIndexPage}
import org.scalatest.concurrent.PatienceConfiguration.Timeout
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.{DoNotDiscover, Matchers, FlatSpec}
import play.api.libs.iteratee.Enumerator
import TagPages._

import scala.language.postfixOps
import scala.concurrent.duration._

@DoNotDiscover class TagPagesTest extends FlatSpec with Matchers with ScalaFutures {
  "alphaIndexKey" should "return the downcased first character of an ASCII string" in {
    val words = Seq(
      "monads" -> "m",
      "are" -> "a",
      "cool" -> "c",
      "So" -> "s",
      "Is" -> "i",
      "Rob" -> "r"
    )

    for ((word, char) <- words) {
      alphaIndexKey(word) shouldEqual char
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
      "Ù" -> "u"
    )

    for ((unicode, ascii) <- words) {
      alphaIndexKey(unicode) shouldEqual ascii
    }
  }

  it should "index by 0-9 if the first character is a digit" in {
    val fixtures = Seq(
      "100 Years of Solitude",
      "1984",
      "20,000 Leagues Under the Sea"
    )

    for (fixture <- fixtures) {
      alphaIndexKey(fixture) shouldEqual "1-9"
    }
  }

  "byWebTitle" should "convert an enumerator of tags into a Future of alpha-ordered TagPages" in {
    def tagFixture(webTitle: String) =
      ApiTag(
        "id/id",
        TagType.Type,
        None,
        None,
        webTitle,
        "",
        ""
      )

    val activateTag = tagFixture("Activate")
    val archivedSpeakersTag = tagFixture("Archived speakers")
    val blogTag = tagFixture("Blog")
    val advertisingTag = tagFixture("Advertising")
    val otherDigitalSolutionsTag = tagFixture("Other digital solutions")

    toPages(Enumerator(
      activateTag,
      archivedSpeakersTag,
      blogTag,
      advertisingTag,
      otherDigitalSolutionsTag
    ).run(byWebTitle).futureValue(Timeout(1 second)))(_.toUpperCase, asciiLowerWebTitle) shouldEqual Seq(
      TagIndexPage(
        "a",
        "A",
        List(
          activateTag,
          advertisingTag,
          archivedSpeakersTag
        ).map(TagDefinition.fromContentApiTag)
      ),
      TagIndexPage(
        "b",
        "B",
        List(
          TagDefinition.fromContentApiTag(blogTag)
        )
      ),
      TagIndexPage(
        "o",
        "O",
        List(
          TagDefinition.fromContentApiTag(otherDigitalSolutionsTag)
        )
      )
    )
  }
}
