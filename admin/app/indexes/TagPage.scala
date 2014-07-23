package indexes

import common.Maps._
import com.gu.openplatform.contentapi.model.Tag
import java.text.Normalizer

import play.api.libs.iteratee.{Iteratee, Enumerator}

import scala.concurrent.ExecutionContext

object TagPage {
  def indexCharacter(s: String) =
    Normalizer.normalize(s, Normalizer.Form.NFD).replaceAll("[^\\p{ASCII}]", "").toLowerCase.charAt(0)

  def fromEnumerator(enumerator: Enumerator[Tag])(implicit executionContext: ExecutionContext) =
    enumerator.run(Iteratee.fold[Tag, Map[Char, Set[Tag]]](Map.empty) { (acc, tag) =>
      insertWith(acc, indexCharacter(tag.webTitle), Set(tag))(_ union _)
    }) map { tagsByCharacter =>
      tagsByCharacter.toSeq.sortBy(_._1) map { case (indexCharacter, tagSet) =>
        TagPage(indexCharacter, tagSet.toSeq.sortBy(_.webTitle.toLowerCase))
      }
    }
}

case class TagPage(
  indexCharacter: Char,
  tags: Seq[Tag]
)
