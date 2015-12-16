package commercial.feeds

import conf.Configuration.commercial.merchandisingFeedsRoot
import services.S3

sealed trait FeedStore {

  def put(feedName: String, feed: Feed): Unit
  def get(feedName: String): Option[String]
}

object S3FeedStore extends FeedStore {

  def put(feedName: String, feed: Feed): Unit =
    S3.putPrivate(key = s"$merchandisingFeedsRoot/latest/$feedName", value = feed.content, feed.contentType)

  def get(feedName: String): Option[String] = S3.get(s"$merchandisingFeedsRoot/latest/$feedName")
}
