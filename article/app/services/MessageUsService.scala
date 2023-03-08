package services

import common.{Box, GuLogging}
import model.MessageUsConfigData

import scala.concurrent.{ExecutionContext, Future}

class MessageUsService(messageUsS3Client: S3Client[MessageUsConfigData]) extends GuLogging {

  private val MAX_LIVEBLOGS_WITH_MESSAGE_US = 50
  private val messageUsConfigData = Box[Option[Map[String, MessageUsConfigData]]](None)

  def refreshMessageUsData()(implicit executionContext: ExecutionContext): Future[Unit] = {
    val listOfKeys = messageUsS3Client
      .getListOfKeys()
      .map(keys => {
        if (keys.length > MAX_LIVEBLOGS_WITH_MESSAGE_US)
          log.warn(s"Over 50 live blogs are stored in S3, only caching the first 50 and ignoring the rest!")
        keys.take(MAX_LIVEBLOGS_WITH_MESSAGE_US)
      })
    val retrievedMessageUsConfigs = listOfKeys.map { key =>
      key.map {
        retrieveMessageUsConfig(_)
      }
    }

    retrievedMessageUsConfigs
      .flatMap(Future.sequence(_))
      .map(response => {
        messageUsConfigData send Some(response.toMap)
        log.info("successfully refreshed message us configs")
      })
      .recover {
        case e =>
          log.error(s"Could not refresh message us configs due to \'${e.getMessage}\'")
      }
  }

  def getBlogMessageUsConfigData(blogId: String): Option[MessageUsConfigData] = {
    messageUsConfigData.get().flatMap(_.get(blogId))
  }

  def getAllMessageUsConfigData: Option[Map[String, MessageUsConfigData]] = {
    messageUsConfigData.get()
  }

  private def retrieveMessageUsConfig(key: String)(implicit executionContext: ExecutionContext) = {
    messageUsS3Client.getObject(key).map { res => key -> res }
  }
}
