package services.newsletters

import com.gu.Box
import common._
import play.api.libs.json.{JsError, JsSuccess}

import scala.concurrent.{ExecutionContext, Future}

class EmailEmbedAgent(newsletterApi: NewsletterApi) extends Logging {

  private val agent = Box[Either[JsError, List[NewsletterResponse]]](Right(Nil))

  def refresh()(implicit ec: ExecutionContext): Future[Either[JsError, List[NewsletterResponse]]] = {
    log.info("Refreshing newsletters for newsletter signup embeds.")

    val newslettersQuery = newsletterApi.getNewsletters()

    newslettersQuery.flatMap { newsletters =>
      agent.alter(newsletters match {
        case succ: JsSuccess[List[NewsletterResponse]] =>
          Right(succ.get)
        case err: JsError => Left(err)
      })
    }
  }

  def getNewsletterByName(listName: String): Either[JsError, Option[NewsletterResponse]] = {
    agent.get() match {
      case Left(err)          => Left(err)
      case Right(newsletters) => Right(newsletters.find(newsletter => newsletter.id == listName))
    }
  }

  def getNewsletterById(listId: Int): Either[JsError, Option[NewsletterResponse]] = {
    agent.get() match {
      case Left(err) => Left(err)
      // TODO: Amend Identity API endpoint to reveal listIdV1. Needed to prevent breaking old iframes
      // find(newsletter => newsletter.listId == listId || newsletter.listIdv1 == listId),
      case Right(newsletters) => Right(newsletters.find(newsletter => newsletter.exactTargetListId == listId))
    }
  }

}
