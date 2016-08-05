package jobs

import common.{Edition, ExecutionContexts, Logging}
import conf.Configuration.commercial._
import contentapi.ContentApiClient
import contentapi.ContentApiClient._
import model.{Content, ContentType}
import ophan.SurgingContentAgent
import services.EmailService

import scala.concurrent.Future

case class SportsSurging(
                          id: String,
                          pageViewCount: Int,
                          content: Option[ContentType]) {

  val sportsTargetedKeywords = List("sport/sport","sport/rio-2016","sport/olympics-general")

  private val matchesKeyword = content.exists(_.tags.keywordIds.exists(keyword =>
    sportsTargetedKeywords.contains(keyword)
  ))

  val isSportsSurgingContent: Boolean = matchesKeyword && pageViewCount > 100
}

case class SurgingSportEmailJob(emailService: EmailService) extends Logging with ExecutionContexts {

  private val subject = "New surging sports content"

  def run() : Future[Unit] = {
    val futureEmail: Option[Future[Unit]] = for {
      adTech <- adTechTeam
      surgingContentEmail <- surgingContentTeam
    } yield {

      getAllSportsSurgingContent
        .map( surgingContent => {
          val sportsSurgingEmailBody = surgingContent.filter(_.isSportsSurgingContent)
          if(sportsSurgingEmailBody.nonEmpty){
            emailService.send(
              from = adTech,
              to = surgingContentEmail.split(","),
              subject = subject,
              htmlBody = Some(htmlBody(sportsSurgingEmailBody)))
          } else{
            Future.successful(())
          }

        })
        .map( _ => ())
    }


    futureEmail.getOrElse(Future.successful( () ))
  }

  def getAllSportsSurgingContent: Future[Seq[SportsSurging]] = {
    val surging: Seq[(String, Int)] = SurgingContentAgent.getSurging.sortedSurges

    Future.sequence(surging.map(Function.tupled(getContentFromId)))
  }

  def getContentFromId(id: String, viewCount: Int): Future[SportsSurging] = {
    getResponse(ContentApiClient.item(id, Edition.defaultEdition))
        .map(response =>
          SportsSurging(
            id = id,
            pageViewCount = viewCount,
            content = response.content.map(Content(_))
          )
        )
  }


  private def htmlBody(surgingContent: Seq[SportsSurging]): String = {
    views.html.commercial.email.surgingSportContent(surgingContent).body.trim()
  }

}
