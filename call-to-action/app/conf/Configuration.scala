package cta.conf

import com.gu.conf.ConfigurationFactory

object Configuration {

  lazy private val configuration = ConfigurationFactory("call-to-action", "env")

  lazy val ctaHostName = configuration.getStringProperty("cta-host")

  lazy val cacheControlMaxAge = configuration.getIntegerProperty("cache-control", 3600)
}



