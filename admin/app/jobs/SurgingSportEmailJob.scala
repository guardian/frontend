package jobs

import common.{ExecutionContexts, Logging}
import conf.Configuration.commercial._
import ophan.SurgingContentAgent
import services.EmailService

import scala.concurrent.Future

case class SurgingSportEmailJob(emailService: EmailService) extends Logging with ExecutionContexts {

  private val subject = "New surging sports content"

  def run() : Future[Unit] = {
    val futureEmail: Option[Future[Unit]] = for {
      adTech <- adTechTeam
      surgingContent <- surgingContentTeam
    } yield {
      emailService.send(
        from = adTech,
        to = surgingContent.split(","),
        subject = subject,
        htmlBody = Some(htmlBody)).map( _ => ())

    }

    futureEmail.getOrElse(Future.successful( () ))
  }

  private def htmlBody: String = {
    val surging: Seq[(String, Int)] = SurgingContentAgent.getSurging.sortedSurges
    views.html.commercial.email.surgingSportContent().body.trim()
  }

}
