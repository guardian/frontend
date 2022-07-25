package topics

import common.{Box, GuLogging}
import model.{TopicsApiResponse, TopicResult, Topic}

import scala.concurrent.{ExecutionContext, Future}

class TopicService(topicS3Client: TopicS3Client) extends GuLogging {

  private val topicsDetails = Box[Option[Map[String, TopicsApiResponse]]](None)

  def refreshTopics()(implicit executionContext: ExecutionContext): Future[Unit] = {
    val listOfKeys = topicS3Client
      .getListOfKeys()
      .map(keys => {
        if (keys.length > 50)
          log.warn(s"Over 50 live blogs are stored in S3, only caching the first 50 and ignoring the rest!")
        keys.take(50)
      })
    val retrievedTopics = listOfKeys.map { key => key.map { retrieveTopicsDetails(_) } }

    retrievedTopics
      .flatMap(Future.sequence(_))
      .map(response => {
        topicsDetails send Some(response.toMap)
        log.info("successfully refreshed topics")
      })
      .recover {
        case e =>
          log.error("Could not refresh topics", e)
      }
  }

  def getBlogTopicsApiResponse(blogId: String): Option[TopicsApiResponse] = {
    topicsDetails.get().flatMap(_.get(blogId))
  }

  def getAvailableTopics(blogId: String): Option[Seq[Topic]] = {
    getBlogTopicsApiResponse(blogId).map(topicsApiResponse =>
      topicsApiResponse.results.map(topic => Topic(topic.`type`, topic.name, Some(topic.count))),
    )
  }

  def getAllTopics: Option[Map[String, TopicsApiResponse]] = {
    topicsDetails.get()
  }

  def getSelectedTopic(
      blogId: String,
      topicEntity: Topic,
  ): Option[TopicResult] = {
    getBlogTopicsApiResponse(blogId).flatMap(_.results.find(result => {
      result.`type` == topicEntity.`type` && result.name == topicEntity.value
    }))
  }

  private def retrieveTopicsDetails(key: String)(implicit executionContext: ExecutionContext) = {
    topicS3Client.getObject(key).map { res => key -> res }
  }
}
