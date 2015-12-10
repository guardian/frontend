package slices

import common.Maps._
import model.pressed.PressedContent
import play.api.libs.json.Json

import scala.util.Try

object Story {
  implicit val jsonFormat = Json.format[Story]

  implicit val ordering = Ordering.by[Story, Int](_.group)

  def unboosted(n: Int) = Story(n, isBoosted = false)

  private [slices] def segmentByGroup(stories: Seq[Story]): Map[Int, Seq[Story]] = {
    stories.foldLeft(Map.empty[Int, Seq[Story]]) { (acc, story) =>
      insertWith(acc, story.group, Seq(story)) { (a, b) =>
        b ++ a
      }
    }
  }

  def fromFaciaContent(faciaContent: PressedContent): Story = {
    Story(
      /** Stories that are not assigned to a group are treated as standard (0) items */
      Try(faciaContent.properties.group.toInt).getOrElse(0),
      faciaContent.properties.isBoosted
    )
  }
}

case class Story(
  group: Int,
  isBoosted: Boolean
)
