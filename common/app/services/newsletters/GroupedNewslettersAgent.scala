package services.newsletters

import com.gu.Box
import common.GuLogging

import scala.concurrent.{ExecutionContext, Future}

class GroupedNewslettersAgent(newsletterApi: NewsletterApi) extends GuLogging {

  val emptyGroupedNewslettersResponse = GroupedNewslettersResponse(
    GroupedNewsletterResponse("News roundups", Nil),
    GroupedNewsletterResponse("News by topic", Nil),
    GroupedNewsletterResponse("Features", Nil),
    GroupedNewsletterResponse("Fport", Nil),
    GroupedNewsletterResponse("Culture", Nil),
    GroupedNewsletterResponse("Lifestyle", Nil),
    GroupedNewsletterResponse("Comment", Nil),
    GroupedNewsletterResponse("Work", Nil),
    GroupedNewsletterResponse("From the papers", Nil),
  )

  private val groupedNewslettersAgent =
    Box[Either[String, GroupedNewslettersResponse]](Right(emptyGroupedNewslettersResponse))

  def refresh()(implicit ec: ExecutionContext): Future[Either[String, GroupedNewslettersResponse]] = {
    log.info("Refreshing Grouped Newsletters for round up page.")

    val groupedNewslettersQuery = newsletterApi.getGroupedNewsletters()

    groupedNewslettersQuery.flatMap { newsletters =>
      log.info(s"*** ${newsletters.toString}")
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
        val errMessage = s"Call to Newsletter API failed: ${e.getMessage}"
        log.error(errMessage)
        Left(errMessage)
    }

  }

  def getGroupedNewsletters(): Either[String, GroupedNewslettersResponse] = {
    groupedNewslettersAgent.get() match {
      case Left(err) => Left(err)
      case Right(groupedNewsletters) =>
        Right(groupedNewsletters)
    }
  }

}
