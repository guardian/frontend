package common.commercial

import common.Edition
import model._
import org.joda.time.DateTime

object BrandHunter {

  private def findBranding(activeBrandings: Option[Seq[Branding]],
                           publicationDate: Option[DateTime],
                           edition: Edition): Option[Branding] = {
    activeBrandings flatMap (_ find (_.isTargeting(publicationDate, edition)))
  }

  def findSectionBranding(section: Section, publicationDate: Option[DateTime], edition: Edition): Option[Branding] = {
    findBranding(section.activeBrandings, publicationDate, edition)
  }

  def findTagBranding(tag: Tag, publicationDate: Option[DateTime], edition: Edition): Option[Branding] = {
    findBranding(tag.properties.activeBrandings, publicationDate, edition)
  }

  def findFrontBranding(frontProps: FrontProperties, edition: Edition): Option[Branding] = {
    findBranding(frontProps.activeBrandings, publicationDate = None, edition)
  }

  def findContentBranding(content: ContentType, edition: Edition): Option[Branding] = {
    // TODO: incorporate branding by section - needs capi change to get section element in content results
    val tags = content.tags
    val publicationDate = Some(content.trail.webPublicationDate)
    val brandingByTags = tags.tags.flatMap(findTagBranding(_, publicationDate, edition)).headOption
    brandingByTags
  }
}
