package commercial.feeds

import conf.Configuration.commercial.merchandisingFeedsLatest
import services.S3

object S3FeedStore {

  private def key(feedName: String): String = s"$merchandisingFeedsLatest/$feedName"

  def put(feedName: String, feed: Feed): Unit = S3.putPrivate(key(feedName), value = feed.content, feed.contentType)

  def get(feedName: String): Option[String] = S3.get(key(feedName))
}
