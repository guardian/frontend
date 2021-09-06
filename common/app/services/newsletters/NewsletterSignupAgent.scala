package services.newsletters

import com.gu.Box
import common.GuLogging

import scala.concurrent.{ExecutionContext, Future}

class NewsletterSignupAgent(newsletterApi: NewsletterApi) extends GuLogging {

  // Newsletters (not grouped by theme)
  private val newslettersAgent = Box[Either[String, List[NewsletterResponse]]](Right(Nil))

  def refreshNewsletters()(implicit ec: ExecutionContext): Unit = {
    log.info("Refreshing newsletters for newsletter signup embeds.")

    val newslettersQuery = newsletterApi.getNewsletters()

    newslettersQuery.flatMap { newsletters =>
      newslettersAgent.alter(newsletters match {
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
    newslettersAgent.get() match {
      case Left(err)          => Left(err)
      case Right(newsletters) => Right(newsletters.find(newsletter => newsletter.id == listName))
    }
  }

  def getNewsletterById(listId: Int): Either[String, Option[NewsletterResponse]] = {
    newslettersAgent.get() match {
      case Left(err) => Left(err)
      case Right(newsletters) =>
        Right(
          newsletters.find(newsletter => newsletter.exactTargetListId == listId || newsletter.listIdv1 == listId),
        )
    }
  }

  // Grouped Newsletters (grouped by theme)

  private val groupedNewslettersAgent =
    Box[Either[String, GroupedNewslettersResponse]](Right(GroupedNewslettersResponse.empty))

  def refreshGroupedNewsletters()(implicit ec: ExecutionContext): Unit = {
    log.info("Refreshing Grouped Newsletters for round up page.")

    val groupedNewslettersQuery = newsletterApi.getGroupedNewsletters()

    groupedNewslettersQuery.flatMap { newsletters =>
      groupedNewslettersAgent.alter(newsletters match {
        case Right(response) =>
          log.info("Successfully refreshed Grouped Newsletters cache.")
          Right(response)
        case Left(err) =>
          log.error(s"Failed to refresh Grouped Newsletters cache: $err")
          Left(err)
      })
    } recover {
      case e =>
        val errMessage = s"Call to Grouped Newsletter API failed: ${e.getMessage}"
        log.error(errMessage)
        Left(errMessage)
    }

  }

  def getGroupedNewsletters(): Either[String, GroupedNewslettersResponse] = groupedNewslettersAgent.get()

  def getNewsletters(): Either[String, List[NewsletterResponse]] = newslettersAgent.get()

  def refresh()(implicit ec: ExecutionContext): Unit = {
    refreshNewsletters()
    refreshGroupedNewsletters()
  }

}
