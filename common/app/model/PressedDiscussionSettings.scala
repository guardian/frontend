package model.pressed

import com.gu.facia.api.utils.FaciaContentUtils
import com.gu.facia.api.{models => fapi}

final case class PressedDiscussionSettings(
    isCommentable: Boolean,
    isClosedForComments: Boolean,
    discussionId: Option[String],
)

object PressedDiscussionSettings {
  def make(content: fapi.FaciaContent): PressedDiscussionSettings =
    PressedDiscussionSettings(
      isCommentable = FaciaContentUtils.isCommentable(content),
      isClosedForComments = FaciaContentUtils.isClosedForComments(content),
      discussionId = FaciaContentUtils
        .discussionId(content)
        //TODO: this is a quick fix only - remove once we've released a fixed fapi client
        .map(_.replaceFirst("^[a-zA-Z]+://www.theguardian.com", "")),
    )
}
