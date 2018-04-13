package services

import java.net.URL
import common.Logging
import scala.util.Try

object SkimLinksCache extends Logging {

  log.info("INITIALISING SKIMLINKSCACHE")

  // evil mutable variable here so that we can cache skimlinks on startup
  private var skimLinks = Set[String]()

  def getSkimLinks: Set[String] = {
    if (skimLinks.nonEmpty) {
      log.info(s"Already got ${skimLinks.size} links")
      skimLinks
    } else {
      log.info("Fetching and caching skimlinks")
      val domains = S3.get("skimlinks/skimlinks-domains.csv").getOrElse{
        log.warn("Failed to fetch skimlinks from S3")
        ""
      }
      skimLinks = domains.split(",").toSet
      skimLinks
    }
  }

  def isSkimLink(link: String): Boolean = {
    log.info(s"ANALYZING LINK FOR SKIMLINKS $link")
    val uri: Option[URL] = Try(new URL(link)).toOption
    uri.exists(u => {
      log.info(s"url we're doing: $u")
      // strip the www. subdomain as it is not included in the list of domains from the skimlinks api
      val cleanedHost = u.getHost.replace("www.", "")
      getSkimLinks.contains(cleanedHost)
    })
  }
}
