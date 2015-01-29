package jobs

import common.Logging
import conf.Configuration.commercial.{adOpsTeam, adTechTeam, gLabsTeam}
import dfp.{AdvertisementFeature, GuLineItem}
import services.EmailService
import tools.Store
import conf.Configuration.commercial.dfpAdFeatureReportKey

object ExpiringAdFeaturesEmailJob extends Logging {

  def run(): Unit = {
    val adFeatureTags = Store.getDfpPaidForTags(dfpAdFeatureReportKey).paidForTags

    def adFeatures(p: GuLineItem => Boolean): Seq[GuLineItem] = {
      adFeatureTags.withFilter {
        _.lineItems.forall(p)
      }.flatMap {
        _.lineItems
      }.sortBy { lineItem =>
        (lineItem.endTime.map(_.getMillis).get, lineItem.id)
      }.distinct
    }

    for {
      adTech <- adTechTeam
      adOps <- adOpsTeam
      gLabs <- gLabsTeam
    } {

      val expiredAdFeatures = adFeatures(_.isExpiredRecently)
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
          to = Seq(gLabs, adOps),
          cc = Seq(adTech),
          subject = "Expiring Advertisement Features",
          htmlBody = Some(htmlBody))
      }
    }
  }
}
