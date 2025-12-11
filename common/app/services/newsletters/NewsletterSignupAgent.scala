package services.newsletters

import common.{Box, GuLogging}
import services.newsletters.GroupedNewslettersResponse.GroupedNewslettersResponse
import services.newsletters.model.{NewsletterResponse, NewsletterResponseV2, NewsletterLayout}

import scala.concurrent.{ExecutionContext, Future}

class NewsletterSignupAgent(newsletterApi: NewsletterApi) extends GuLogging {

  // Newsletters
  private val newslettersAgent = Box[Either[String, List[NewsletterResponse]]](Right(Nil))
  // Grouped Newsletters (grouped by group)
  private val groupedNewslettersAgent = Box[Either[String, GroupedNewslettersResponse]](Right(List.empty))
  // Newsletters version 2
  private val newslettersV2Agent = Box[Either[String, List[NewsletterResponseV2]]](Right(Nil))
  // Newsletter layouts
  private val newsletterLayoutsAgent = Box[Either[String, Map[String, NewsletterLayout]]](Right(Map.empty))

  def getNewsletterByName(listName: String): Either[String, Option[NewsletterResponse]] = {
    newslettersAgent.get() match {
      case Left(err)          => Left(err)
      case Right(newsletters) => Right(newsletters.find(newsletter => newsletter.identityName == listName))
    }
  }

  def getNewsletterById(listId: Int): Either[String, Option[NewsletterResponse]] = {
    newslettersAgent.get() match {
      case Left(err)          => Left(err)
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
      case Left(err)          => Left(err)
      case Right(newsletters) =>
        Right(
          newsletters.find(newsletter => newsletter.listId == listId),
        )
    }
  }

  def getGroupedNewsletters(): Either[String, GroupedNewslettersResponse] = groupedNewslettersAgent.get()

  def getNewsletters(): Either[String, List[NewsletterResponse]] = newslettersAgent.get()

  def getV2Newsletters(): Either[String, List[NewsletterResponseV2]] = newslettersV2Agent.get()

  def getNewsletterLayouts(): Either[String, Map[String, NewsletterLayout]] = newsletterLayoutsAgent.get()

  def refresh()(implicit ec: ExecutionContext): Future[Unit] = {
    refreshNewsletters() recover { case e =>
      val errMessage = s"Call to Newsletter API failed: ${e.getMessage}"
      log.error(errMessage)
    }
  }

  private def refreshNewsletters()(implicit ec: ExecutionContext): Future[Unit] = {
    log.info("Refreshing newsletters and Grouped Newsletters for newsletter signup embeds, and v2 newsletters.")

    newsletterApi.getNewsletters() map {
      case Right(allNewsletters) =>
        val supportedNewsletters = allNewsletters.filterNot(_.cancelled)

        newslettersAgent.alter(Right(supportedNewsletters))
        groupedNewslettersAgent.alter(Right(buildGroupedNewsletters(supportedNewsletters)))

        log.info("Successfully refreshed Newsletters and Grouped Newsletters embed cache.")
      case Left(err) =>
        log.error(s"Failed to refresh Newsletters and Grouped Newsletters embed cache: $err")
    }

    newsletterApi.getV2Newsletters() map {
      case Right(allNewsletters) =>
        newslettersV2Agent.alter(Right(allNewsletters))
        log.info("Successfully refreshed v2 Newsletters cache.")
      case Left(err) =>
        log.error(s"Failed to refresh v2  Newsletters cache: $err")
    }

    newsletterApi.getNewsletterLayouts() map {
      case Right(layoutsMap) =>
        newsletterLayoutsAgent.alter(Right(layoutsMap))
        log.info("Successfully refreshed newsletters layouts cache.")
      case Left(err) =>
        log.error(s"Failed to refresh newsletters layouts cache: $err")
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
