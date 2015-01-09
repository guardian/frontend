package jobs

import common.Logging
import conf.Configuration.commercial._
import dfp.{AdvertisementFeature, GuLineItem}
import services.EmailService
import tools.Store

object ExpiringAdFeaturesEmailJob extends Logging {

  def run(): Unit = {
    val adFeatureTags =
      Store.getDfpPaidForTags().paidForTags filter (_.paidForType == AdvertisementFeature)

    def adFeatures(p: GuLineItem => Boolean): Seq[GuLineItem] = {
      adFeatureTags.filter(_.lineItems.forall(p)).flatMap(_.lineItems).sortBy(_.id).distinct
    }

    for {
      adTech <- adTechTeam
    } {

      val expiredAdFeatures = adFeatures(_.isExpired)
      val expiringAdFeatures = adFeatures(_.isExpiringSoon)

      if (expiredAdFeatures.nonEmpty || expiringAdFeatures.nonEmpty) {

        val htmlBody = {
          views.html.commercial.email.expiringAdFeatures(
            expiredAdFeatures,
            expiringAdFeatures
          ).body.trim()
        }

        EmailService.send(
          from = adTech,
          to = Seq(adTech),
          subject = "Expiring Advertisement Features",
          htmlBody = Some(htmlBody))
      }
    }
  }
}
