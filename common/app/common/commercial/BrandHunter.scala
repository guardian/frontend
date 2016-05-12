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

  // difficult to find content's section at the moment so this param is temporarily optional
  def findContentBranding(section: Option[Section],
                          tags: Tags,
                          publicationDate: Option[DateTime],
                          edition: Edition): Option[Branding] = {
    lazy val brandingBySection = section flatMap (findSectionBranding(_, publicationDate, edition))
    lazy val brandingByTags = tags.tags.flatMap(findTagBranding(_, publicationDate, edition)).headOption
    brandingBySection orElse brandingByTags
  }
}
