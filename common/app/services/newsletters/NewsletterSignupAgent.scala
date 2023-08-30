package services.newsletters

import common.{Box, GuLogging}
import services.newsletters.model.{NewsletterResponse, NewsletterResponseV2}

import scala.concurrent.{ExecutionContext, Future}

class NewsletterSignupAgent(newsletterApi: NewsletterApi) extends GuLogging {

  // Newsletters
  private val newslettersAgent = Box[Either[String, List[NewsletterResponse]]](Right(Nil))
  // Newsletters version 2
  private val newslettersV2Agent = Box[Either[String, List[NewsletterResponseV2]]](Right(Nil))

  def getNewsletterByName(listName: String): Either[String, Option[NewsletterResponse]] = {
    newslettersAgent.get() match {
      case Left(err)          => Left(err)
      case Right(newsletters) => Right(newsletters.find(newsletter => newsletter.identityName == listName))
    }
  }

  def getNewsletterById(listId: Int): Either[String, Option[NewsletterResponse]] = {
    newslettersAgent.get() match {
      case Left(err) => Left(err)
      case Right(newsletters) =>
        Right(
          newsletters.find(newsletter => newsletter.listId == listId || newsletter.listIdV1 == listId),
        )
    }
  }

  def getV2NewsletterByName(listName: String): Either[String, Option[NewsletterResponseV2]] = {
    newslettersV2Agent.get() match {
      case Left(err)          => Left(err)
      case Right(newsletters) => Right(newsletters.find(newsletter => newsletter.identityName == listName))
    }
  }

  def getV2NewsletterById(listId: Int): Either[String, Option[NewsletterResponseV2]] = {
    newslettersV2Agent.get() match {
      case Left(err) => Left(err)
      case Right(newsletters) =>
        Right(
          newsletters.find(newsletter => newsletter.listId == listId),
        )
    }
  }

  def getNewsletters(): Either[String, List[NewsletterResponse]] = newslettersAgent.get()

  def getV2Newsletters(): Either[String, List[NewsletterResponseV2]] = newslettersV2Agent.get()

  def refresh()(implicit ec: ExecutionContext): Future[Unit] = {
    refreshNewsletters() recover {
      case e =>
        val errMessage = s"Call to Newsletter API failed: ${e.getMessage}"
        log.error(errMessage)
    }
  }

  private def refreshNewsletters()(implicit ec: ExecutionContext): Future[Unit] = {
    log.info("Refreshing newsletters and v2 newsletters.")

    newsletterApi.getNewsletters() map {
      case Right(allNewsletters) =>
        val supportedNewsletters = allNewsletters.filterNot(_.cancelled)

        newslettersAgent.alter(Right(supportedNewsletters))

        log.info("Successfully refreshed Newsletters cache.")
      case Left(err) =>
        log.error(s"Failed to refresh Newsletters cache: $err")
    }

    newsletterApi.getV2Newsletters() map {
      case Right(allNewsletters) =>
        newslettersV2Agent.alter(Right(allNewsletters))
        log.info("Successfully refreshed v2 Newsletters cache.")
      case Left(err) =>
        log.error(s"Failed to refresh v2  Newsletters cache: $err")
    }
  }
}
