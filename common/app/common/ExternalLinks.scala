package common

import java.net.URI

import conf.Configuration

import scala.util.Try

object ExternalLinks {
  val GuardianDomains = Configuration.ajax.corsOrigins flatMap { url =>
    Try {
      new URI(url).getHost
    }.toOption
  }

  def external(url: String) = Try(Option(new URI(url).getHost).exists({ host => !GuardianDomains.exists({ domain =>
    host == domain || host.endsWith(s".$domain")
  })})).getOrElse(false)
}
