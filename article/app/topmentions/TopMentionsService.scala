package topmentions

import common.{Box, GuLogging}
import model.{TopMentionsDetails, TopMentionsResult, TopMentionsTopic}

import scala.concurrent.{ExecutionContext, Future}

class TopMentionsService(topMentionsS3Client: TopMentionsS3Client) extends GuLogging {

  private val topMentions = Box[Option[Map[String, TopMentionsDetails]]](None)

  def refreshTopMentions()(implicit executionContext: ExecutionContext): Future[Unit] = {
    val retrievedTopMentions = topMentionsS3Client.getListOfKeys().map { key => key.map { retrieveTopMention(_) } }

    retrievedTopMentions
      .flatMap(Future.sequence(_))
      .map(response => topMentions send Some(response.toMap))
      .recover {
        case e =>
          log.error("Could not refresh top mentions", e)
      }
  }

  def getBlogTopMentions(blogId: String): Option[TopMentionsDetails] = {
    topMentions.get().flatMap(_.get(blogId))
  }

  def getAllTopMentions(): Option[Map[String, TopMentionsDetails]] = {
    topMentions.get()
  }

  def getTopMentionsByTopic(
      blogId: String,
      topMentionEntity: TopMentionsTopic,
  ): Option[TopMentionsResult] = {

    getBlogTopMentions(blogId).flatMap(_.results.find(result => {
      result.`type` == topMentionEntity.`type` && result.name == topMentionEntity.value
    }))
  }

  private def retrieveTopMention(key: String)(implicit executionContext: ExecutionContext) = {
    topMentionsS3Client.getObject(key).map { res => key -> res }
  }
}
