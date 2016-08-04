package jobs

import com.gu.contentapi.client.model.v1.ItemResponse
import common.{Edition, ExecutionContexts, Logging}
import conf.Configuration.commercial._
import contentapi.ContentApiClient
import contentapi.ContentApiClient._
import model.{ContentType, Content}
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

    val response: Future[ItemResponse] = getResponse(ContentApiClient.item("/sport/sdomsdf/sadfasf", Edition.defaultEdition))

    val futureContent: Future[Option[ContentType]] = response.map { response => response.content.map(Content(_))  }

    futureContent.map( maybeContent =>
      maybeContent.map ( (content: ContentType) =>
        content.tags.keywordIds.contains("rio")
      )
    )

    views.html.commercial.email.surgingSportContent().body.trim()
  }

}
