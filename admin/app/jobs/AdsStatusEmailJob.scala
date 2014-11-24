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
      from <- adTechTeam
      to <- adOpsTeam
      cc <- adTechTeam
    } yield {
        EmailService.send(from, Seq(to), Seq(cc), subject, textBody)
    }
  }

  private def textBody: String = {
    views.html.commercial.email.adsStatus(
      pageskinsWithoutEdition, geotargetedAdFeatures, sponsorshipsWithoutSponsors
    ).body
  }

  private def pageskinsWithoutEdition: Seq[PageSkinSponsorship] = {
    Store.getDfpPageSkinnedAdUnits().deliverableSponsorships.filter(_.editions.isEmpty)
  }

  private def geotargetedAdFeatures: Seq[Sponsorship] = {
    Store.getDfpAdFeatureTags().sponsorships.filter(_.countries.nonEmpty)
  }

  private def sponsorshipsWithoutSponsors: Seq[Sponsorship] = {
    val sponsorships = Store.getDfpSponsoredTags().sponsorships ++
      Store.getDfpAdFeatureTags().sponsorships ++
      Store.getDfpFoundationSupportedTags().sponsorships
    sponsorships.filter(_.sponsor.isEmpty) sortBy (_.lineItemId)
  }

}
