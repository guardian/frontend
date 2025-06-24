package common

import scala.concurrent.duration._
import org.joda.time.Instant
import conf.Configuration
import services.ParameterStore
import experiments.{ActiveExperiments, CommercialPrebidTest}
import play.api.mvc.RequestHeader

object CommercialBundle {
  import GuardianConfiguration._

  private lazy val parameterStore = new ParameterStore(Environment.awsRegion)

  private val cacheDuration: FiniteDuration = 1.minute
  private val stage = Environment.stage.toLowerCase()
  // private val bundlePathKey = s"/frontend/$stage/commercial.bundlePath"
  private def bundlePathKey(implicit request: RequestHeader): String = {
    if (ActiveExperiments.isParticipating(CommercialPrebidTest))
      s"/frontend/$stage/commercial.bundlePath"
    else
      s"/frontend/$stage/commercial.bundlePath"
  }

  // when running locally Configuration.assets.path is set to "assets/" to serve local assets, but the commercial bundle no longer lives there, so we need to override it
  private val basePath =
    if (stage == "dev") "https://assets.guim.co.uk/" else Configuration.assets.path

  private var cachedBundlePath: String = bundlePathFromParameterStore
  // private def cachedBundlePath(implicit request: RequestHeader): String = bundlePathFromParameterStore
  private var cachedTimestamp: Instant = Instant.now()

  private def bundlePathFromParameterStore(implicit request: RequestHeader): String = {
    if (stage == "devinfra" || stage == "localtest") {
      // don't read from parameter store in these environments as there may not be any credentials
      "commercial"
    } else {
      parameterStore.get(bundlePathKey)
    }
  }

  private def bundlePath(implicit request: RequestHeader): String = {
    if (Instant.now().isAfter(cachedTimestamp.plus(cacheDuration.toMillis))) {
      cachedBundlePath = bundlePathFromParameterStore
      cachedTimestamp = Instant.now()
    }

    cachedBundlePath
  }

  def bundleUrl(implicit request: RequestHeader): String = s"$basePath$bundlePath"
}
