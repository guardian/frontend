package indexes

import com.gu.openplatform.contentapi.model.{Tag => ApiTag}
import model.{TagDefinition, TagIndexPage}
import org.scalatest.concurrent.PatienceConfiguration.Timeout
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.{Matchers, FlatSpec}
import play.api.libs.iteratee.Enumerator
import TagPages._

import scala.language.postfixOps
import scala.concurrent.duration._
import scala.concurrent.ExecutionContext.Implicits.global

class TagPagesTest extends FlatSpec with Matchers with ScalaFutures {
  "indexCharacter" should "return the downcased first character of an ASCII string" in {
    val words = Seq(
      "monads" -> 'm',
      "are" -> 'a',
      "cool" -> 'c',
      "So" -> 's',
      "Is" -> 'i',
      "Rob" -> 'r'
    )

    for ((word, char) <- words) {
      indexCharacter(word) shouldEqual char
    }
  }

  it should "return the downcased ASCII equivalent of the first letter in a Unicode string, if available" in {
    val words = Seq(
      "á" -> 'a',
      "č" -> 'c',
      "ž" -> 'z',
      "ý" -> 'y',
      "Á" -> 'a',
      "Ò" -> 'o',
      "Ù" -> 'u'
    )

    for ((unicode, ascii) <- words) {
      indexCharacter(unicode) shouldEqual ascii
    }
  }

  "fromEnumerator" should "convert an enumerator of tags into a Future of alpha-ordered TagPages" in {
    def tagFixture(webTitle: String) =
      ApiTag(
        "",
        "",
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

    fromEnumerator(Enumerator(
      activateTag,
      archivedSpeakersTag,
      blogTag,
      advertisingTag,
      otherDigitalSolutionsTag
    )).futureValue(Timeout(1 second)) shouldEqual Seq(
      TagIndexPage(
        'a',
        List(
          activateTag,
          advertisingTag,
          archivedSpeakersTag
        ).map(TagDefinition.fromContentApiTag)
      ),
      TagIndexPage(
        'b',
        List(
          TagDefinition.fromContentApiTag(blogTag)
        )
      ),
      TagIndexPage(
        'o',
        List(
          TagDefinition.fromContentApiTag(otherDigitalSolutionsTag)
        )
      )
    )
  }
}
