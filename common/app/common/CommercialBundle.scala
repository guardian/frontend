package common

import scala.concurrent.duration._
import org.joda.time.Instant
import conf.Configuration
import services.ParameterStore

object CommercialBundle {
  import GuardianConfiguration._

  private lazy val parameterStore = new ParameterStore(Environment.awsRegion)

  private val cacheDuration: FiniteDuration = 1.minute
  private val stage = Environment.stage.toLowerCase()
  private val bundlePathKey = s"/frontend/$stage/commercial.bundlePath"

  // when running locally Configuration.assets.path is set to "assets/" to serve local assets, but the commercial bundle no longer lives there, so we need to override it
  private val basePath =
    if (stage == "dev") "https://assets.guim.co.uk/" else Configuration.assets.path

  private var cachedBundlePath: String = bundlePathFromParameterStore(true)
  private var cachedTimestamp: Instant = Instant.now()

  private def bundlePathFromParameterStore(isVariant: Boolean): String = {
  if (stage == "devinfra" || stage == "localtest") {
    "commercial"
  } else {
    val pathKey = if (isVariant)
      s"/frontend/$stage/commercial.bundlePath.variant"
    else
      s"/frontend/$stage/commercial.bundlePath"

    parameterStore.get(pathKey)
  }
}

def bundleUrl(isVariant: Boolean): String =
  s"$basePath${bundlePath(isVariant)}"

private def bundlePath(isVariant: Boolean): String = {
  if (Instant.now().isAfter(cachedTimestamp.plus(cacheDuration.toMillis))) {
    cachedBundlePath = bundlePathFromParameterStore(isVariant)
    cachedTimestamp = Instant.now()
  }

  cachedBundlePath
}
  @overload
  def bundleUrl(isVariant: Boolean): String =
    s"$basePath${bundlePath(isVariant)}"

  // fallback for older callers
  def bundleUrl: String = bundleUrl(isVariant = false)
}
