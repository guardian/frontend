package common.commercial

import common.Edition
import model.{Branding, Section, Tag, Tags}
import org.joda.time.DateTime

object BrandHunter {

  def findSectionBranding(section: Section, publicationDate: Option[DateTime], edition: Edition): Option[Branding] = {
    section.activeBrandings flatMap { brandings =>
      brandings find (_.isTargeting(publicationDate, edition))
    }
  }

  def findTagBranding(tag: Tag, publicationDate: Option[DateTime], edition: Edition): Option[Branding] = {
    tag.properties.activeBrandings flatMap (_ find (_.isTargeting(publicationDate, edition)))
  }

  // difficult to find content's section at the moment so this param is temporarily optional
  def findBranding(section: Option[Section],
                   tags: Tags,
                   publicationDate: Option[DateTime],
                   edition: Edition): Option[Branding] = {
    lazy val brandingBySection = section flatMap (findSectionBranding(_, publicationDate, edition))
    lazy val brandingByTags = tags.tags.flatMap(findTagBranding(_, publicationDate, edition)).headOption
    brandingBySection orElse brandingByTags
  }
}
