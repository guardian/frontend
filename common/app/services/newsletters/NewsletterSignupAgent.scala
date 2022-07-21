package services.newsletters

import common.{Box, GuLogging}
import services.newsletters.GroupedNewslettersResponse.GroupedNewslettersResponse
import services.newsletters.model.NewsletterResponse

import scala.concurrent.{ExecutionContext, Future}

class NewsletterSignupAgent(newsletterApi: NewsletterApi) extends GuLogging {

  // Newsletters
  private val newslettersAgent = Box[Either[String, List[NewsletterResponse]]](Right(Nil))
  // Grouped Newsletters (grouped by group)
  private val groupedNewslettersAgent = Box[Either[String, GroupedNewslettersResponse]](Right(List.empty))

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

  def getGroupedNewsletters(): Either[String, GroupedNewslettersResponse] = groupedNewslettersAgent.get()

  def getNewsletters(): Either[String, List[NewsletterResponse]] = newslettersAgent.get()

  def refresh()(implicit ec: ExecutionContext): Future[Unit] = {
    refreshNewsletters() recover {
      case e =>
        val errMessage = s"Call to Newsletter API failed: ${e.getMessage}"
        log.error(errMessage)
    }
  }

  private def refreshNewsletters()(implicit ec: ExecutionContext): Future[Unit] = {
    log.info("Refreshing newsletters and Grouped Newsletters for newsletter signup embeds.")

    newsletterApi.getNewsletters() map {
      case Right(allNewsletters) =>
        val supportedNewsletters = allNewsletters.filterNot(_.cancelled)

        newslettersAgent.alter(Right(supportedNewsletters))
        groupedNewslettersAgent.alter(Right(buildGroupedNewsletters(supportedNewsletters)))

        log.info("Successfully refreshed Newsletters and Grouped Newsletters embed cache.")
      case Left(err) =>
        log.error(s"Failed to refresh Newsletters and Grouped Newsletters embed cache: $err")
    }

  }

  private def buildGroupedNewsletters(newsletters: List[NewsletterResponse]): GroupedNewslettersResponse = {
    val displayedNewsletters = newsletters.filter(n => !n.paused && !n.restricted)
    val groupedNewsletters = displayedNewsletters.groupBy(n => n.group)

    displayedNewsletters
      .map(_.group)
      .distinct
      .map { group => (group, groupedNewsletters.getOrElse(group, Nil)) }
  }

}
