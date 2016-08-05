package jobs

import common.{Edition, ExecutionContexts, Logging}
import conf.Configuration.commercial._
import contentapi.ContentApiClient
import contentapi.ContentApiClient._
import model.{Content, ContentType}
import ophan.SurgingContentAgent
import services.EmailService

import scala.concurrent.Future

case class SurgingContent(
                          id: String,
                          pageViewCount: Int,
                          content: Option[ContentType]) {

  val sportsTargetedKeywords = List("sport/sport","sport/rio-2016","sport/olympics-general")

  private val matchesKeyword = content.exists(_.tags.keywordIds.exists(keyword =>
    sportsTargetedKeywords.contains(keyword)
  ))

  val isSportsSurgingContent: Boolean = matchesKeyword && pageViewCount > 500
}

case class SurgingSportEmailJob(emailService: EmailService) extends Logging with ExecutionContexts {

  private val subject = "New surging sports content"

  def run() : Future[Unit] = {

    for {
      adTech <- adTechTeam
      surgingContentEmail <- surgingContentTeam
    } yield {
      getAllSurgingContent onSuccess { case surgingContent =>
        val sportsSurgingEmailBody = surgingContent.filter(_.isSportsSurgingContent)
        if (sportsSurgingEmailBody.nonEmpty) {
          emailService.send(
            from = adTech,
            to = surgingContentEmail.split(","),
            subject = subject,
            htmlBody = Some(extractHtmlBody(sportsSurgingEmailBody)))
        }
      }
    }
    Future.successful(())
  }



  def getAllSurgingContent: Future[Seq[SurgingContent]] = {
    val surging: Seq[(String, Int)] = SurgingContentAgent.getSurging.sortedSurges

    Future.sequence(surging.map(Function.tupled(getContentFromId)))
  }

  def getContentFromId(id: String, viewCount: Int): Future[SurgingContent] = {
    getResponse(ContentApiClient.item(id, Edition.defaultEdition))
        .map(response =>
          SurgingContent(
            id = id,
            pageViewCount = viewCount,
            content = response.content.map(Content(_))
          )
        )
  }


  private def extractHtmlBody(surgingContent: Seq[SurgingContent]): String = {
    views.html.commercial.email.surgingSportContent(surgingContent).body.trim()
  }

}
