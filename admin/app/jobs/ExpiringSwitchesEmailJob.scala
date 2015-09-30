package jobs

import common.{ExecutionContexts, Logging}
import conf.Configuration.frontend.webEngineersEmail
import conf.switches.Switches
import services.EmailService

import scala.util.control.NonFatal

object ExpiringSwitchesEmailJob extends ExecutionContexts with Logging {

  def run(): Unit = {
    for (webEngineers <- webEngineersEmail) {
      val expiringSwitches = Switches.all.filter(_.expiresSoon)

      if (expiringSwitches.nonEmpty) {
        val (imminent, soon) = expiringSwitches.partition(_.daysToExpiry < 2)
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

      } else {
        log.info("No expiring switches")
      }
    }
    if (webEngineersEmail.isEmpty) log.warn("Recipient not configured")
  }
}
