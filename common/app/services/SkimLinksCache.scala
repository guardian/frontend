package services

import java.net.URL
import java.util.concurrent.atomic.AtomicReference

import app.LifecycleComponent
import common.Logging

import scala.concurrent.ExecutionContext
import scala.util.Try

object SkimLinksCache extends Logging {

    private val skimLinkDomains = new AtomicReference(Set[String]())

  def populateSkimLinkDomains(): Unit = {
    log.info("Fetching and caching skimlinks")
    val domains = S3.get("skimlinks/skimlinks-domains.csv").getOrElse{
      log.error("Failed to fetch skimlinks from S3")
      ""
    }
    skimLinkDomains.set(domains.split(",").toSet)
  }

  def isSkimLink(link: String): Boolean = {
    val uri: Option[URL] = Try(new URL(link)).toOption
    uri.exists(u => {
      // strip the www. subdomain as it is not included in the list of domains from the skimlinks api
      val cleanedHost = u.getHost.replace("www.", "")
      skimLinkDomains.get().contains(cleanedHost)
    })
  }
}

class SkimLinksCacheLifeCycle()(implicit ec: ExecutionContext) extends LifecycleComponent {

  override def start(): Unit = {
    SkimLinksCache.populateSkimLinkDomains()
  }
}
