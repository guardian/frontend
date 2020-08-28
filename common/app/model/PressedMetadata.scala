package model.pressed

import com.gu.contentapi.client.utils.DesignType
import model.{DotcomContentType, Pillar, SectionId}

final case class PressedMetadata(
    id: String,
    webTitle: String,
    webUrl: String,
    `type`: Option[DotcomContentType],
    pillar: Option[Pillar],
    sectionId: Option[SectionId],
    designType: DesignType,
)
