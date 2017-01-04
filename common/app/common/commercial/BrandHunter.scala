package common.commercial

import common.Edition
import model.{ContentType, MetaData, Tags, Trail}
import org.joda.time.DateTime

object BrandHunter {

  def findBranding(
    activeBrandings: Option[Seq[Branding]],
    edition: Edition,
    publicationDate: Option[DateTime]
  ): Option[Branding] = {
    activeBrandings flatMap (_ find (_.isTargeting(publicationDate, edition)))
  }

  private def findBranding(
    metadata: MetaData,
    tags: Tags,
    edition: Edition,
    publicationDate: Option[DateTime]
  ): Option[Branding] = {

    lazy val brandingBySection = metadata.section.flatMap { section =>
      findBranding(section.activeBrandings, edition, publicationDate)
    }

    lazy val brandingByTags = tags.tags.flatMap { tag =>
      findBranding(tag.properties.activeBrandings, edition, publicationDate)
    }.headOption

    brandingByTags orElse brandingBySection
  }

  def findContentBranding(content: ContentType, edition: Edition): Option[Branding] = {
    if (content.commercial.isInappropriateForSponsorship) None
    else findBranding(content.metadata, content.tags, edition, Some(content.trail.webPublicationDate))
  }

  /*
   * Even though paid content is never edition-specific, there may be another type of sponsorship that takes precedence
   * so we need to consider the edition.
   */
  def isPaidContent(trail: Trail, edition: Edition): Boolean = {
    val trailBranding = findBranding(trail.metadata, trail.tags, edition, Some(trail.webPublicationDate))
    trailBranding.exists(_.sponsorshipType == PaidContent)
  }
}
