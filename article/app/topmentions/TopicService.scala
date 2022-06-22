package topmentions

import common.{Box, GuLogging}
import model.{TopicsDetails, TopicResult, Topic, TopicWithCount}

import scala.concurrent.{ExecutionContext, Future}

class TopicService(topicsS3Client: TopicS3Client) extends GuLogging {

  private val blogsTopicsDetails = Box[Option[Map[String, TopicsDetails]]](None)

  def refreshTopicsDetails()(implicit executionContext: ExecutionContext): Future[Unit] = {
    val retrievedTopicsDetails =
      topicsS3Client.getListOfKeys().map { key => key.map { retrieveAllTopicsDetails(_) } }

    retrievedTopicsDetails
      .flatMap(Future.sequence(_))
      .map(response => {
        blogsTopicsDetails send Some(response.toMap)
        log.info("successfully refreshed top mentions")
      })
      .recover {
        case e =>
          log.error("Could not refresh top mentions", e)
      }
  }

  def getBlogTopicsDetails(blogId: String): Option[TopicsDetails] = {
    blogsTopicsDetails.get().flatMap(_.get(blogId))
  }

  def getTopics(blogId: String): Option[Seq[TopicWithCount]] = {
    getBlogTopicsDetails(blogId).map(mentions =>
      mentions.results.map(mention => TopicWithCount(mention.`type`, mention.name, mention.count)),
    )
  }

  def getAllTopicsDetails: Option[Map[String, TopicsDetails]] = {
    blogsTopicsDetails.get()
  }

  def getTopicResult(
      blogId: String,
      topic: Topic,
  ): Option[TopicResult] = {

    getBlogTopicsDetails(blogId).flatMap(_.results.find(result => {
      result.`type` == topic.`type` && result.name == topic.value
    }))
  }

  private def retrieveAllTopicsDetails(key: String)(implicit executionContext: ExecutionContext) = {
    topicsS3Client.getObject(key).map { res => key -> res }
  }
}
