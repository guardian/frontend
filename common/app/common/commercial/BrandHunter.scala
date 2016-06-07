package common.commercial

import common.Edition
import model._
import org.joda.time.DateTime

object BrandHunter {

  def findBranding(
    activeBrandings: Option[Seq[Branding]],
    edition: Edition,
    publicationDate: Option[DateTime]
  ): Option[Branding] = {
    activeBrandings flatMap (_ find (_.isTargeting(publicationDate, edition)))
  }

  def findContentBranding(content: ContentType, edition: Edition): Option[Branding] = {
    val publicationDate = Some(content.trail.webPublicationDate)

    val brandingBySection = content.metadata.section.flatMap { section =>
      findBranding(section.activeBrandings, edition, publicationDate)
    }

    val brandingByTags = content.tags.tags.flatMap { tag =>
      findBranding(tag.properties.activeBrandings, edition, publicationDate)
    }.headOption

    brandingBySection orElse brandingByTags
  }
}
