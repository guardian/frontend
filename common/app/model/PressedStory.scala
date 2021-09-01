package model.pressed

import com.gu.contentapi.client.model.v1.Content
import com.gu.contentapi.client.utils.CapiModelEnrichment.RichContent
import common.TrailsToRss
import model.content.{Atoms, MediaAtom}
import model.{Commercial, Elements, Fields, MetaData, Pillar, SectionId, Tags, Trail}

final case class PressedStory(
    trail: PressedTrail,
    metadata: PressedMetadata,
    fields: PressedFields,
    elements: PressedElements,
    tags: Tags,
)

object PressedStory {

  def apply(apiContent: Content): PressedStory = {

    val fields: Fields = Fields.make(apiContent)
    val metadata = MetaData.make(fields, apiContent)
    val elements = Elements.make(apiContent)
    val tags = Tags.make(apiContent)
    val commercial = Commercial.make(tags, apiContent)
    val trail = Trail.make(tags, fields, commercial, elements, metadata, apiContent)
    val atoms = Atoms.make(apiContent)
    val sectionId: Option[SectionId] = metadata.section.map(s => SectionId(s.value))

    new PressedStory(
      PressedTrail(
        trail.trailPicture,
        trail.byline,
        trail.thumbnailPath,
        trail.webPublicationDate,
      ),
      PressedMetadata(
        metadata.id,
        metadata.webTitle,
        metadata.webUrl,
        metadata.contentType,
        Pillar(apiContent),
        sectionId,
        apiContent.designType,
        metadata.format,
      ),
      PressedFields(
        fields.main,
        TrailsToRss.introFromContent(model.Content.make(apiContent)),
        fields.standfirst,
      ),
      PressedElements(
        elements.mainVideo,
        atoms.fold(Seq.empty[MediaAtom])(_.media),
      ),
      tags,
    )
  }

}
