package topmentions

import common.{Box, GuLogging}
import model.{TopMention, TopMentionsDetails}

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

  def getTopMention(blogId: String): Option[TopMentionsDetails] = {
    topMentions.get().flatMap(_.get(blogId))
  }

  def getTopMentionList(blogId: String): Option[Seq[TopMention]] = {
    getTopMention(blogId).map(mentions =>
      mentions.results.map(mention => TopMention(mention.name, mention.`type`, mention.count)),
    )
  }

  def getAllTopMentions(): Option[Map[String, TopMentionsDetails]] = {
    topMentions.get()
  }

  private def retrieveTopMention(key: String)(implicit executionContext: ExecutionContext) = {
    topMentionsS3Client.getObject(key).map { res => key -> res }
  }
}
