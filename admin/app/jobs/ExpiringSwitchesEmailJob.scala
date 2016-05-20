package jobs

import common.{ExecutionContexts, Logging}
import conf.Configuration.frontend.webEngineersEmail
import conf.switches.{Switch, Switches}
import services.EmailService

import scala.concurrent.Future
import scala.util.control.NonFatal

object ExpiringSwitchesEmailJob extends ExecutionContexts with Logging {

  def run(): Future[Unit] = {
    (for (webEngineers <- webEngineersEmail) yield {
      val expiringSwitches = Switches.all.filter(Switch.expiry(_).expiresSoon)

      if (expiringSwitches.nonEmpty) {
        val (imminent, soon) = expiringSwitches.partition(Switch.expiry(_).daysToExpiry.get < 2)
        val htmlBody = views.html.email.expiringSwitches(imminent, soon).body.trim()
        val eventualResult = EmailService.send(
          from = webEngineers,
          to = Seq(webEngineers),
          subject = "Expiring Feature Switches",
          htmlBody = Some(htmlBody))

        eventualResult onSuccess {
          case result => log.info(s"Message sent successfully with ID: ${result.getMessageId}")
        }

        eventualResult onFailure {
          case NonFatal(e) => log.error(s"Message failed: ${e.getMessage}")
        }

        eventualResult.map(_ => ())
      } else {
        log.info("No expiring switches")
        Future.successful(())
      }
    }).getOrElse(
      Future {
        log.warn("Recipient not configured")
      }
    )
  }
}
