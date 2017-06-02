package common

import java.net.URI

import conf.Configuration

import scala.util.Try

object ExternalLinks {
  val GuardianDomains = Configuration.ajax.corsOrigins flatMap { uri =>
    Try {
      new URI(uri).getHost.stripPrefix("www.")
    }.toOption
  }

  def external(url: String): Boolean = Try(Option(new URI(url).getHost).exists({ host => !GuardianDomains.exists({ domain =>
    host == domain || host.endsWith(s".$domain")
  })})).getOrElse(false)

  def internalPath(url: String): Option[String] = if (external(url)) None else Try {
    Option(new URI(url).getPath)
  }.toOption.flatten
}
