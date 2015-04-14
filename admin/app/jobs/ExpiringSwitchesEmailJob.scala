package jobs

import common.Logging
import conf.Configuration.frontend.webEngineersEmail
import conf.Switches
import conf.Switches.SendExpiringSwitchesEmail
import services.EmailService

object ExpiringSwitchesEmailJob extends Logging {

  def run(): Unit = {
    if (SendExpiringSwitchesEmail.isSwitchedOn) {
      for (webEngineers <- webEngineersEmail) {
        val expiringSwitches = Switches.all.filter(_.expiresSoon)

        if (expiringSwitches.nonEmpty) {
          val (imminent, soon) = expiringSwitches.partition(_.daysToExpiry < 2)
          val htmlBody = views.html.email.expiringSwitches(imminent, soon).body.trim()
          EmailService.send(
            from = webEngineers,
            to = Seq(webEngineers),
            subject = "Expiring Feature Switches",
            htmlBody = Some(htmlBody))
        }
      }
    }
  }
}
