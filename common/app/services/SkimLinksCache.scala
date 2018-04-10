package services

import java.net.URL
import common.Logging
import scala.util.Try

object SkimLinksCache extends Logging {

  // evil mutable variable here so that we can cache skimlinks on startup
  private var skimLinks = Set[String]()

  def getSkimLinks: Set[String] = {
    if (skimLinks.nonEmpty) {
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
  // initialise immediately upon startup
  getSkimLinks

  def isSkimLink(link: String): Boolean = {
    val uri: Option[URL] = Try(new URL(link)).toOption
    uri.exists(u => {
      // strip the www. subdomain as it is not included in the list of domains from the skimlinks api
      val cleanedHost = u.getHost.replace("www.", "")
      getSkimLinks.contains(cleanedHost)
    })
  }
}
