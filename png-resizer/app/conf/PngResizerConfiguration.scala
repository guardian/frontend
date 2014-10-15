package conf

import play.api.Play.current

object PngResizerConfiguration {
  private val configuration = current.configuration
  val cacheTimeInSeconds = configuration.getInt("image_cache_time").getOrElse(86400)
  val ttlInSeconds = configuration.getInt("image_ttl").getOrElse(86400)
}
