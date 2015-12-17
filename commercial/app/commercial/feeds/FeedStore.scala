package commercial.feeds

import conf.Configuration.commercial.merchandisingFeedsRoot
import services.S3

object S3FeedStore {

  def put(feedName: String, feed: Feed): Unit =
    S3.putPrivate(key = s"$merchandisingFeedsRoot/latest/$feedName", value = feed.content, feed.contentType)

  def get(feedName: String): Option[String] = S3.get(s"$merchandisingFeedsRoot/latest/$feedName")
}
