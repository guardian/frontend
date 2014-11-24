package common

import java.net.URI

import scala.util.Try

object ExternalLinks {
  val GuardianDomains = Seq(
    "theguardian.com",
    "guardian.co.uk",
    "dev-theguardian.com"
  )

  def external(url: String) = Try(Option(new URI(url).getHost).exists({ host => !GuardianDomains.exists({ domain =>
    host == domain || host.endsWith(s".$domain")
  })})).getOrElse(false)
}
