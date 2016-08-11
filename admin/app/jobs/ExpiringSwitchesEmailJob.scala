package jobs

import common.{ExecutionContexts, Logging}
import conf.Configuration.frontend.webEngineersEmail
import conf.switches.{Switch, Switches}
import services.EmailService

import scala.concurrent.Future
import scala.util.control.NonFatal

case class ExpiringSwitchesEmailJob(emailService: EmailService) extends ExecutionContexts with Logging {

  def run(): Future[Unit] = {
    (for (webEngineers <- webEngineersEmail) yield {
      val expiringSwitches = Switches.all.filter(Switch.expiry(_).expiresSoon)

      if (expiringSwitches.nonEmpty) {
        val htmlBody = views.html.email.expiringSwitches(expiringSwitches).body.trim()
        val eventualResult = emailService.send(
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

case class ExpiringSwitchesGroup(switches: Seq[Switch], description: String)

case class ExpiringSwitches(switches: Seq[Switch]) {

  // Return switches group ordered by expiration priority
  def groupByPriority: Seq[ExpiringSwitchesGroup] = {

    val expiredSwitches = switches.filter(Switch.expiry(_).hasExpired)
    val expiringTodaySwitches = switches.filter(Switch.expiry(_).daysToExpiry.exists(_ == 0))
    val expiringTomorrowSwitches = switches.filter(Switch.expiry(_).daysToExpiry.exists(_ == 1))
    val expiringInTwoDaysSwitches = switches.filter(Switch.expiry(_).daysToExpiry.exists(_ == 2))
    val otherSwitches = switches.filter(Switch.expiry(_).daysToExpiry.exists(expiration => expiration > 2 && expiration < 8))

    Seq(
      ExpiringSwitchesGroup(expiredSwitches, "already expired"),
      ExpiringSwitchesGroup(expiringTodaySwitches, "expiring today"),
      ExpiringSwitchesGroup(expiringTomorrowSwitches, "expiring tomorrow"),
      ExpiringSwitchesGroup(expiringInTwoDaysSwitches, "expiring in 2 days"),
      ExpiringSwitchesGroup(otherSwitches, "expiring within a week")
    )
  }
}
