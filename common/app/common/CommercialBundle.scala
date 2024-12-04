package common

import scala.concurrent.duration._
import org.joda.time.Instant
import conf.Configuration
import services.ParameterStore

object CommercialBundle {
  import GuardianConfiguration._

  private lazy val parameterStore = new ParameterStore(Environment.awsRegion)

  private var cachedBundlePath: String =
    "test_commercial_bundles/" + bundlePathParameterValue
  private var cachedTimestamp: Instant = Instant.now()
  private val cacheDuration: FiniteDuration = 1.minute

  private val assetHost = Configuration.assets.path

  private def bundlePathParameterValue: String = {
    if (Environment.stage == "CODE")
      parameterStore.get("/frontend/CODE/commercial.bundlePath")
    else
      parameterStore.get("/frontend/commercial.bundlePath")
  }

  private def updateBundlePath(): Unit = {
    cachedBundlePath = "test_commercial_bundles/" + bundlePathParameterValue
    cachedTimestamp = Instant.now()
  }

  private def bundlePath: String = {
    if (Instant.now().isAfter(cachedTimestamp.plus(cacheDuration.toMillis))) updateBundlePath()

    cachedBundlePath
  }

  def getBundleUrl: String = s"$assetHost$bundlePath"
}
