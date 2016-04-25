package common.commercial

import common.Edition
import model.{Branding, Tags}
import org.joda.time.DateTime

object BrandHunter {

  def findBranding(tags: Tags, publicationDate: Option[DateTime], edition: Edition): Option[Branding] = {

    def findBrandingBySection(): Option[Branding] = None

    def findBrandingByTag(): Option[Branding] = {
      val tagProperties = tags.tags map (_.properties)
      val brandings = tagProperties.flatMap(_.activeBrandings).flatten
      brandings find (_.isTargeting(publicationDate, edition))
    }

    findBrandingBySection() orElse findBrandingByTag()
  }
}
