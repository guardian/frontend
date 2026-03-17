package common

import scala.concurrent.duration._
import conf.Configuration
import services.ParameterStore

import java.time.Instant
import java.time.temporal.ChronoUnit

object CommercialBundle {
  import GuardianConfiguration._

  private lazy val parameterStore = new ParameterStore(Environment.awsRegion)

  private val cacheDuration: FiniteDuration = 1.minute
  private val stage = Environment.stage.toLowerCase()
  private val bundlePathKey = s"/frontend/$stage/commercial.bundlePath"

  // when running locally Configuration.assets.path is set to "assets/" to serve local assets, but the commercial bundle no longer lives there, so we need to override it
  private val basePath =
    if (stage == "dev") "https://assets.guim.co.uk/" else Configuration.assets.path

  private var cachedBundlePath: String = bundlePathFromParameterStore
  private var cachedTimestamp: Instant = Instant.now()

  private def bundlePathFromParameterStore: String = {
    if (stage == "devinfra" || stage == "localtest") {
      // don't read from parameter store in these environments as there may not be any credentials
      "commercial"
    } else {
      parameterStore.get(bundlePathKey)
    }
  }

  private def bundlePath: String = {
    if (Instant.now().isAfter(cachedTimestamp.plus(cacheDuration.toMillis, ChronoUnit.MILLIS))) {
      cachedBundlePath = bundlePathFromParameterStore
      cachedTimestamp = Instant.now()
    }

    cachedBundlePath
  }

  def bundleUrl: String = s"$basePath$bundlePath"
}
