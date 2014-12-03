package jobs

import common.Logging
import conf.Configuration.commercial._
import dfp.{PageSkinSponsorship, Sponsorship}
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
    val sponsorshipsReport = Store.getDfpSponsoredTags()
    val adFeaturesReport = Store.getDfpAdFeatureTags()
    val foundationsReport = Store.getDfpFoundationSupportedTags()

    val pageskinsWithoutEdition: Seq[PageSkinSponsorship] = {
      pageSkinsReport.deliverableSponsorships.filter(_.editions.isEmpty)
    }

    val geotargetedAdFeatures: Seq[Sponsorship] = {
      adFeaturesReport.sponsorships.filter(_.countries.nonEmpty)
    }

    val sponsorshipsWithoutSponsors: Seq[Sponsorship] = {
      val sponsorships = sponsorshipsReport.sponsorships ++
        adFeaturesReport.sponsorships ++
        foundationsReport.sponsorships
      sponsorships.filter(_.sponsor.isEmpty) sortBy (_.lineItemId)
    }

    views.html.commercial.email.adsStatus(
      pageskinsWithoutEdition,
      geotargetedAdFeatures,
      sponsorshipsWithoutSponsors
    ).body
  }

}
