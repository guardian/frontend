package topmentions

import common.GuLogging

import scala.concurrent.{ExecutionContext, Future}

class TopMentionsService(topMentionsS3Client: TopMentionsS3Client) extends GuLogging {
  def refreshTopMentions()(implicit executionContext: ExecutionContext): Future[List[Boolean]] = {
    val result = topMentionsS3Client.getListOfKeys().map { keys =>
      keys.map { key =>
        refreshTopMention(key)
      }
    }

    result.flatMap(Future.sequence(_))
  }

  private def refreshTopMention(key: String)(implicit executionContext: ExecutionContext) = {
    val response = topMentionsS3Client.getObject(key)
    response.map { res =>
      log.info("store in memory")
      true
    }
  }
}
