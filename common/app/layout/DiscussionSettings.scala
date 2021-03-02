package layout

import model.pressed._

case class DiscussionSettings(
    isCommentable: Boolean,
    isClosedForComments: Boolean,
    discussionId: Option[String],
)

object DiscussionSettings {
  def fromTrail(faciaContent: PressedContent): DiscussionSettings =
    DiscussionSettings(
      faciaContent.discussion.isCommentable,
      faciaContent.discussion.isClosedForComments,
      //TODO: this is a quick fix only - remove once we've released a fixed fapi client
      faciaContent.discussion.discussionId
        .map(_.replaceFirst("^[a-zA-Z]+://www.theguardian.com", "")),
    )
}
