package navigation

import io.lemonlabs.uri.Url
import conf.Configuration
import enumeratum.EnumEntry

import scala.collection.immutable.IndexedSeq

sealed trait ReaderRevenueSite extends EnumEntry {
  val url: String
}

object ReaderRevenueSite extends enumeratum.Enum[ReaderRevenueSite] {

  override val values: IndexedSeq[ReaderRevenueSite] = findValues

  private def getHost(url: String): Option[String] = Url.parse(url).hostOption.map(_.toString)

  private val hosts: Set[String] = values.flatMap(site => getHost(site.url)).toSet

  def isReaderRevenueSiteUrl(url: String): Boolean = getHost(url).exists(hosts.contains)

  case object Support extends ReaderRevenueSite {
    val url: String = Configuration.id.supportUrl
  }

  case object SupportSubscribe extends ReaderRevenueSite {
    val url: String = s"${Configuration.id.supportUrl}/subscribe"
  }

  case object SupportContribute extends ReaderRevenueSite {
    val url: String = s"${Configuration.id.supportUrl}/contribute"
  }

  case object SupportGifting extends ReaderRevenueSite {
    val url: String = s"${Configuration.id.supportUrl}/subscribe"
  }

  case object SupporterCTA extends ReaderRevenueSite {
    val url: String = s"${Configuration.id.supportUrl}/subscribe"
  }
}
