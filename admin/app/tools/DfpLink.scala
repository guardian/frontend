package tools

import conf.Configuration.commercial.dfpAccountId
import conf.Configuration.site

object DfpLink {

  def lineItem(lineItemId: Long) = {
    s"https://www.google.com/dfp/$dfpAccountId#delivery/LineItemDetail/lineItemId=$lineItemId"
  }
}

object SiteLink {

  def adUnit(path: String): Option[String] = {
    if (path endsWith "/front") {
      val relativePath = path.split("/").drop(1).dropRight(1).mkString("/")
      Some(s"${site.host}/${relativePath}")
    } else {
      None
    }
  }
}
