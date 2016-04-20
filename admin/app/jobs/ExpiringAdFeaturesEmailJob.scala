package jobs

import common.{ExecutionContexts, Logging}
import common.dfp.GuLineItem
import conf.Configuration.commercial.{adOpsTeam, adTechTeam, gLabsTeam}
import dfp.DfpApi
import org.joda.time.DateTime.now
import services.EmailService

import scala.concurrent.Future

object ExpiringAdFeaturesEmailJob extends Logging with ExecutionContexts {

  def run(): Future[Unit] = {

    val adFeatures: Seq[GuLineItem] =
      DfpApi.readAdFeatureLogoLineItems(
        expiredSince = now().minusWeeks(1),
        expiringBefore = now().plusMonths(1)
      ).sortBy { lineItem =>
        (lineItem.endTime.map(_.getMillis).get, lineItem.id)
      }

    (for {
      adTech <- adTechTeam
      adOps <- adOpsTeam
      gLabsCsv <- gLabsTeam
    } yield {
      if (adFeatures.nonEmpty) {

        val (expired, expiring) = adFeatures partition (_.endTime.exists(_.isBeforeNow))

        val gLabs = gLabsCsv.split(",") map (_.trim())

        val htmlBody =
          views.html.commercial.email.expiringAdFeatures(expired, expiring).body.trim()

        EmailService.send(
          from = adTech,
          to = gLabs :+ adOps,
          cc = Seq(adTech),
          subject = "Expiring Advertisement Features",
          htmlBody = Some(htmlBody))
      } else {
        Future.successful(())
      }
    }).getOrElse(Future.successful(())).map(_ => ())
  }
}
