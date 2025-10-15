package services

import java.net.{URI, URL}
import java.util.concurrent.atomic.AtomicReference
import app.LifecycleComponent
import common.GuLogging
import conf.Configuration.affiliateLinks

import scala.concurrent.ExecutionContext
import scala.util.Try

object SkimLinksCache extends GuLogging {

  private val skimLinkDomains = new AtomicReference(Set[String]())

  def populateSkimLinkDomains(): Unit = {
    log.info("Fetching and caching skimlinks")
    val domains = S3Skimlinks.get(affiliateLinks.domainsKey).getOrElse {
      log.error(s"Failed to fetch skimlinks from S3: ${S3Skimlinks.bucket}/${affiliateLinks.domainsKey}")
      ""
    }
    skimLinkDomains.set(domains.split(",").toSet)
  }

  def isSkimLink(link: String): Boolean = {
    val uri: Option[URL] = Try(new URI(link).toURL).toOption
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
