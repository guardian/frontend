package topmentions

import common.{Box, GuLogging}
import model.{TopicsDetails, TopMentionsResult, TopMentionsTopic, TopicWithCount}

import scala.concurrent.{ExecutionContext, Future}

class TopicService(topicS3Client: TopicS3Client) extends GuLogging {

  private val topicsDetails = Box[Option[Map[String, TopicsDetails]]](None)

  def refreshTopics()(implicit executionContext: ExecutionContext): Future[Unit] = {
    val retrievedTopMentions = topicS3Client.getListOfKeys().map { key => key.map { retrieveTopicsDetails(_) } }

    retrievedTopMentions
      .flatMap(Future.sequence(_))
      .map(response => {
        topicsDetails send Some(response.toMap)
        log.info("successfully refreshed top mentions")
      })
      .recover {
        case e =>
          log.error("Could not refresh top mentions", e)
      }
  }

  def getBlogTopicsDetails(blogId: String): Option[TopicsDetails] = {
    topicsDetails.get().flatMap(_.get(blogId))
  }

  def getTopics(blogId: String): Option[Seq[TopicWithCount]] = {
    getBlogTopicsDetails(blogId).map(mentions =>
      mentions.results.map(mention => TopicWithCount(mention.`type`, mention.name, mention.count)),
    )
  }

  def getAllTopics: Option[Map[String, TopicsDetails]] = {
    topicsDetails.get()
  }

  def getSelectedTopic(
      blogId: String,
      topMentionEntity: TopMentionsTopic,
  ): Option[TopMentionsResult] = {
    getBlogTopicsDetails(blogId).flatMap(_.results.find(result => {
      result.`type` == topMentionEntity.`type` && result.name == topMentionEntity.value
    }))
  }

  private def retrieveTopicsDetails(key: String)(implicit executionContext: ExecutionContext) = {
    topicS3Client.getObject(key).map { res => key -> res }
  }
}
