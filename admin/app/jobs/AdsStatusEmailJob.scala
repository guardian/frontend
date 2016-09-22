package jobs

import common.dfp.PageSkinSponsorship
import common.{ExecutionContexts, Logging}
import conf.Configuration.commercial._
import services.EmailService
import tools.Store

import scala.concurrent.Future

case class AdsStatusEmailJob(emailService: EmailService) extends Logging with ExecutionContexts {

  private val subject = "NGW Ad Targeting Status"

  def run(): Future[Unit] = {
    log.info("Starting AdsStatusEmailJob")

    (for {
      adTech <- adTechTeam
      adOps <- adOpsTeam
      adOpsUs <- adOpsUsTeam
      adOpsAu <- adOpsAuTeam
    } yield {
      emailService.send(
        from = adTech,
        to = Seq(adOps, adOpsUs, adOpsAu),
        cc = Seq(adTech),
        subject = subject,
        htmlBody = Some(htmlBody))
    }).getOrElse(Future.successful(())).map(_ => ())
  }

  private def htmlBody: String = {

    val pageskinsWithoutEdition: Seq[PageSkinSponsorship] = {
      Store.getDfpPageSkinnedAdUnits().deliverableSponsorships.filter(_.editions.isEmpty)
    }

    views.html.commercial.email.adsStatus(AdStatusReport(pageskinsWithoutEdition)).body.trim()
  }

}

case class AdStatusReport(pageskinsWithoutEditions: Seq[PageSkinSponsorship]) {

  val isEmpty = pageskinsWithoutEditions.isEmpty
}
