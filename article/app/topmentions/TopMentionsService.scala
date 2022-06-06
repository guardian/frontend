package topmentions

import common.{Box, GuLogging}

import scala.concurrent.{ExecutionContext, Future}
import scala.util.{Failure, Success}

class TopMentionsService(topMentionsS3Client: TopMentionsS3Client) extends GuLogging {

  private val topMentions = Box[Option[Map[String, TopMentionsDetails]]](None)

  def refreshTopMentions()(implicit executionContext: ExecutionContext): Unit = {
    val retrievedTopMentions = topMentionsS3Client.getListOfKeys().map { key => key.map { retrieveTopMention(_) } }

    retrievedTopMentions.flatMap(Future.sequence(_)) onComplete {
      case Success(response) => {
        log.info("Refreshed top mentions successfully")
        val mapped = response.toMap
        topMentions send Some(mapped)
      }
      case Failure(error) =>
        log.error("Could not refresh top mentions", error)
    }
  }

  def get(blogId: String): Option[TopMentionsDetails] = {
    topMentions.get().flatMap(_.get(blogId))
  }

  private def retrieveTopMention(key: String)(implicit executionContext: ExecutionContext) = {
    val response = topMentionsS3Client.getObject(key)

    response.map { res =>
      Future.successful(key -> res)
    }.flatten
  }
}
