package jobs

import common.Logging
import common.dfp.{AdvertisementFeature, GuLineItem, PageSkinSponsorship}
import conf.Configuration.commercial._
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
        to = Seq(adOps, adOpsUs, adOpsAu),
        cc = Seq(adTech),
        subject = subject,
        htmlBody = Some(htmlBody))
    }
  }

  private def htmlBody: String = {
    val paidForTags = Store.getDfpPaidForTags().paidForTags filterNot {
      _.lineItems.forall(_.targeting.hasAdTestTargetting)
    }

    val pageskinsWithoutEdition: Seq[PageSkinSponsorship] = {
      Store.getDfpPageSkinnedAdUnits().deliverableSponsorships.filter(_.editions.isEmpty)
    }

    val geotargetedAdFeatures: Seq[GuLineItem] = {
      val adFeatureTags = paidForTags filter (_.paidForType == AdvertisementFeature)
      val allAdFeatures = adFeatureTags flatMap (_.lineItems)
      allAdFeatures filter (_.targeting.geoTargetsIncluded.nonEmpty) sortBy (_.id)
    }

    val sponsorshipsWithoutSponsors: Seq[GuLineItem] = {
      val lineItems = paidForTags flatMap (_.lineItems)
      lineItems filter (_.sponsor.isEmpty) sortBy (_.id)
    }

    // Will revisit this when glabs have fixed their tagging
    val noSuchTargetedTags: Seq[GuLineItem] = Nil

    views.html.commercial.email.adsStatus(AdStatusReport(
      pageskinsWithoutEdition,
      geotargetedAdFeatures,
      sponsorshipsWithoutSponsors,
      noSuchTargetedTags
    )).body.trim()
  }

}

case class AdStatusReport(pageskinsWithoutEditions: Seq[PageSkinSponsorship],
                          geotargetedAdFeatures: Seq[GuLineItem],
                          sponsorshipsWithoutSponsors: Seq[GuLineItem],
                          noSuchTargetedTags: Seq[GuLineItem]) {

  val isEmpty =
    pageskinsWithoutEditions.isEmpty &&
      geotargetedAdFeatures.isEmpty &&
      sponsorshipsWithoutSponsors.isEmpty &&
      noSuchTargetedTags.isEmpty
}
