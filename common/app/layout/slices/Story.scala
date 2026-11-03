package layout.slices

import common.Maps._
import model.pressed.PressedContent
import play.api.libs.json.{Json, OFormat}

import scala.util.Try

case class Story(
    group: Int,
)

object Story {
  implicit val jsonFormat: OFormat[Story] = Json.format[Story]

  implicit val ordering: Ordering[Story] = Ordering.by[Story, Int](_.group)

  def unboosted(n: Int): Story = Story(n)

  private[slices] def segmentByGroup(stories: Seq[Story]): Map[Int, Seq[Story]] = {
    stories.foldLeft(Map.empty[Int, Seq[Story]]) { (acc, story) =>
      insertWith(acc, story.group, Seq(story)) { (a, b) =>
        b ++ a
      }
    }
  }

  def fromFaciaContent(faciaContent: PressedContent): Story = {
    Story(
      /** Stories that are not assigned to a group are treated as standard (0) items */
      Try(faciaContent.card.group.toInt).getOrElse(0),
    )
  }
}
