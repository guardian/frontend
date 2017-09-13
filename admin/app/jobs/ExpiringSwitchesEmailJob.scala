package jobs

import common.Logging
import conf.Configuration.frontend.{dotcomPlatformEmail, webEngineersEmail}
import conf.switches.{Switch, Switches}
import services.EmailService

import scala.concurrent.{ExecutionContext, Future}
import scala.util.control.NonFatal

case class ExpiringSwitchesEmailJob(emailService: EmailService) extends Logging {

  def run()(implicit executionContext: ExecutionContext): Future[Unit] = runJob(webEngineersEmail)
  def runReminder()(implicit executionContext: ExecutionContext): Future[Unit] = runJob(dotcomPlatformEmail)

  private def runJob(baseRecipientEmail: Option[String])(implicit executionContext: ExecutionContext): Future[Unit] = {
    (for (baseRecipients <- baseRecipientEmail) yield {
      val expiringSwitches = Switches.all.filter(Switch.expiry(_).expiresSoon)

      if (expiringSwitches.nonEmpty) {

        val htmlBody = views.html.email.expiringSwitches(expiringSwitches).body.trim()

        val recipients = {
          val switchOwners = expiringSwitches.flatMap(_.owners.flatMap(_.email)).distinct
          baseRecipients +: switchOwners
        }

        val eventualResult = emailService.send(
          from = baseRecipients,
          to = recipients,
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
    val expiringTodaySwitches = switches.filter(Switch.expiry(_).daysToExpiry.contains(0))
    val expiringTomorrowSwitches = switches.filter(Switch.expiry(_).daysToExpiry.contains(1))
    val expiringInTwoDaysSwitches = switches.filter(Switch.expiry(_).daysToExpiry.contains(2))
    val otherSwitches = switches.filter(Switch.expiry(_).daysToExpiry.exists(expiration => expiration > 2 && expiration < 8))

    Seq(
      ExpiringSwitchesGroup(expiredSwitches, "already expired"),
      ExpiringSwitchesGroup(expiringTodaySwitches, "expiring today at 23:59 (London time)"),
      ExpiringSwitchesGroup(expiringTomorrowSwitches, "expiring tomorrow"),
      ExpiringSwitchesGroup(expiringInTwoDaysSwitches, "expiring in 2 days"),
      ExpiringSwitchesGroup(otherSwitches, "expiring within a week")
    )
  }
}
