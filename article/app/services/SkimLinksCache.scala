package services

import java.net.URI
import common.Logging

object SkimLinksCache extends Logging {

  // evil mutable variable here so that we can cache skimlinks on startup
  private var skimLinks = Set[String]()

  def getSkimLinks: Set[String] = {
    if (skimLinks.nonEmpty) {
      skimLinks
    } else {
      log.info("Fetching and caching skimlinks")
      val domains = S3.get("skimlinks/skimlinks-domains.csv").getOrElse{
        log.warn("Failed to fetch skimlinks cache")
        ""
      }
      skimLinks = domains.split(",").toSet
      skimLinks
    }
  }

  def isSkimLink(link: String): Boolean = {
    // strip the www. subdomain as it is not included in the list of domains from the skimlinks api
    val host = new URI(link).getHost.replace("www.", "")
    getSkimLinks.contains(host)
  }

}
