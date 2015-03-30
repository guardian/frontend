package jobs

import common.Logging
import conf.Configuration.commercial.{adOpsTeam, adTechTeam, dfpAdFeatureReportKey, gLabsTeam}
import dfp.GuLineItem
import services.EmailService
import tools.Store

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
      gLabsCsv <- gLabsTeam
    } {

      val expiredAdFeatures = adFeatures(_.isExpiredRecently)
      val expiringAdFeatures = adFeatures(_.isExpiringSoon)

      if (expiredAdFeatures.nonEmpty || expiringAdFeatures.nonEmpty) {

        val gLabs = gLabsCsv.split(",") map (_.trim())

        val htmlBody = {
          views.html.commercial.email.expiringAdFeatures(
            expiredAdFeatures,
            expiringAdFeatures
          ).body.trim()
        }

        EmailService.send(
          from = adTech,
          to = gLabs :+ adOps,
          cc = Seq(adTech),
          subject = "Expiring Advertisement Features",
          htmlBody = Some(htmlBody))
      }
    }
  }
}
