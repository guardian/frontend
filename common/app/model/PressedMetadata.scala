package model.pressed

import com.gu.contentapi.client.utils.DesignType
import model.ContentFormat.{contentFormatReads, contentFormatWrites}
import model.{ContentFormat, DotcomContentType, Pillar, SectionId}
import play.api.libs.json.Format

final case class PressedMetadata(
    id: String,
    webTitle: String,
    webUrl: String,
    `type`: Option[DotcomContentType],
    pillar: Option[Pillar],
    sectionId: Option[SectionId],
    designType: DesignType,
    format: ContentFormat,
)

object PressedMetadata {
  implicit val contentFormatFormat: Format[ContentFormat] = Format(contentFormatReads, contentFormatWrites)
}
