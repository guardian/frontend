package services

import java.net.URI
import java.util.concurrent.atomic.AtomicReference

import app.LifecycleComponent
import common.GuLogging
import conf.Configuration.affiliateLinks

import scala.concurrent.ExecutionContext
import scala.util.Try

object SkimLinksCache extends GuLogging {

  private val skimLinkDomains = new AtomicReference(Set[String]())

  def populateSkimLinkDomains(): Unit = {
    log.debug("Fetching and caching skimlinks")
    val domains = S3Skimlinks.get(affiliateLinks.domainsKey).getOrElse {
      log.error(s"Failed to fetch skimlinks from S3: ${S3Skimlinks.bucket}/${affiliateLinks.domainsKey}")
      ""
    }
    skimLinkDomains.set(domains.split(",").toSet)
  }

  def isSkimLink(link: String): Boolean = {
    Try(new URI(link)).toOption
      .flatMap(u => Option(u.getHost))
      .map(_.replace("www.", ""))
      .exists(skimLinkDomains.get().contains)
  }
}

class SkimLinksCacheLifeCycle()(implicit ec: ExecutionContext) extends LifecycleComponent {

  override def start(): Unit = {
    SkimLinksCache.populateSkimLinkDomains()
  }
}
