package common

import scala.concurrent.duration._
import org.joda.time.Instant
import conf.Configuration

object CommercialBundle {
  import GuardianConfiguration._

  private var cachedBundlePath: String =
    "test_commercial_bundles/" + configuration.getMandatoryStringProperty("commercial.bundlePath")
  private var cachedTimestamp: Instant = Instant.now()
  private val cacheDuration: FiniteDuration = 1.minute

  private val assetHost = Configuration.assets.path

  private def updateBundlePath(): Unit = {
    cachedBundlePath = "test_commercial_bundles/" + configuration.getMandatoryStringProperty("commercial.bundlePath")
    cachedTimestamp = Instant.now()
  }

  private def bundlePath: String = {
    if (Instant.now().isAfter(cachedTimestamp.plus(cacheDuration.toMillis))) updateBundlePath()

    cachedBundlePath
  }

  def getBundleUrl: String = s"$assetHost$bundlePath"
}
