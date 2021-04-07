package services.newsletters

import com.gu.Box
import common.GuLogging

import scala.concurrent.{ExecutionContext, Future}

class EmailSignupAgent(newsletterApi: NewsletterApi) extends GuLogging {

  private val agent = Box[Either[String, List[NewsletterResponse]]](Right(Nil))

  def refresh()(implicit ec: ExecutionContext): Future[Either[String, List[NewsletterResponse]]] = {
    log.info("Refreshing newsletters for newsletter signup embeds.")

    val newslettersQuery = newsletterApi.getNewsletters()

    newslettersQuery.flatMap { newsletters =>
      agent.alter(newsletters match {
        case Right(response) =>
          log.info("Successfully refreshed Newsletters embed cache.")
          Right(response)
        case Left(err) =>
          log.error(s"Failed to refresh Newsletters embed cache: $err")
          Left(err)
      })
    } recover {
      case e =>
        val errMessage = s"Call to Newsletter API failed: ${e.getMessage}"
        log.error(errMessage)
        Left(errMessage)
    }

  }

  def getNewsletterByName(listName: String): Either[String, Option[NewsletterResponse]] = {
    agent.get() match {
      case Left(err)          => Left(err)
      case Right(newsletters) => Right(newsletters.find(newsletter => newsletter.id == listName))
    }
  }

  def getNewsletterById(listId: Int): Either[String, Option[NewsletterResponse]] = {
    agent.get() match {
      case Left(err) => Left(err)
      case Right(newsletters) =>
        Right(
          newsletters.find(newsletter => newsletter.exactTargetListId == listId || newsletter.listIdv1 == listId),
        )
    }
  }

}
