package jobs

import common.Logging
import conf.Configuration.commercial._
import dfp.{GuLineItem, PageSkinSponsorship}
import services.EmailService
import tools.Store

object AdsStatusEmailJob extends Logging {

  private val subject = "NGW Ad Targeting Status"

  def run(): Unit = {
    log.info("Starting AdsStatusEmailJob")

    for {
      adTech <- adTechTeam
      adOps <- adOpsTeam
      adOpsUs <- adOpsUsTeam
      adOpsAu <- adOpsAuTeam
    } {
      EmailService.send(
        from = adTech,
        // todo reinstate when email addresses have been verified in SES
        // to = Seq(adOps, adOpsUs, adOpsAu),
        to = Seq(adOps),
        cc = Seq(adTech),
        subject = subject,
        htmlBody = Some(htmlBody))
    }
  }

  private def htmlBody: String = {
    val pageSkinsReport = Store.getDfpPageSkinnedAdUnits()
    val paidForTagsReport = Store.getDfpPaidForTags()

    val pageskinsWithoutEdition: Seq[PageSkinSponsorship] = {
      pageSkinsReport.deliverableSponsorships.filter(_.editions.isEmpty)
    }

    val geotargetedAdFeatures: Seq[GuLineItem] = {
      val adFeatureTags =
        paidForTagsReport.advertisementFeatureSeries ++
          paidForTagsReport.advertisementFeatureKeywords
      val allAdFeatures = adFeatureTags flatMap (_.lineItems)
      allAdFeatures filter (_.targeting.geoTargetsIncluded.nonEmpty) sortBy (_.id)
    }

    val sponsorshipsWithoutSponsors: Seq[GuLineItem] = {
      val lineItems = paidForTagsReport.paidForTags flatMap (_.lineItems)
      lineItems filter (_.sponsor.isEmpty) sortBy (_.id)
    }

    views.html.commercial.email.adsStatus(
      pageskinsWithoutEdition,
      geotargetedAdFeatures,
      sponsorshipsWithoutSponsors
    ).body
  }

}
