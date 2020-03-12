package layout

import model.pressed._

case class DiscussionSettings(
  isCommentable: Boolean,
  isClosedForComments: Boolean,
  discussionId: Option[String]
)

object DiscussionSettings {
  def fromTrail(faciaContent: PressedContent): DiscussionSettings = DiscussionSettings(
    faciaContent.discussion.isCommentable,
    faciaContent.discussion.isClosedForComments,
    faciaContent.discussion.discussionId
  )
}
