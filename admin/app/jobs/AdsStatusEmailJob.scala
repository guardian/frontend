package jobs

import conf.Configuration.commercial._
import dfp.{PageSkinSponsorship, Sponsorship}
import services.EmailService
import tools.Store

object AdsStatusEmailJob {

  private val subject = "NGW Ad Targeting Status"

  def run(): Unit = {
    for {
      from <- adTechTeam
      to <- adOpsTeam
      cc <- adTechTeam
    } yield {
      EmailService.send(from, Seq(to), Seq(cc), subject, textBody)
    }
  }

  private def textBody: String = {
    views.html.commercial.email.adsStatus(pageskinsWithoutEdition, geotargetedAdFeatures).body
  }

  private def pageskinsWithoutEdition: Seq[PageSkinSponsorship] = {
    Store.getDfpPageSkinnedAdUnits().deliverableSponsorships.filter(_.editions.isEmpty)
  }

  private def geotargetedAdFeatures: Seq[Sponsorship] = {
    Store.getDfpAdFeatureTags().sponsorships.filter(_.countries.nonEmpty)
  }

}
