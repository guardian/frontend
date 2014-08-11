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

    def getRelativePath(dropFromRight: Int) = path.split("/").drop(1).dropRight(dropFromRight).mkString("/")

    lazy val relativePath = getRelativePath(1)
    lazy val relativeEditionalisedPath = getRelativePath(2)

    if (path endsWith "/front") {
      Some(s"${site.host}/${relativePath}")
    } else if (path endsWith "/front/ng") {
      Some(s"${site.host}/${relativeEditionalisedPath}?view=mobile")
    } else if (path endsWith "/front/r2") {
      Some(s"${site.host}/${relativeEditionalisedPath}?view=classic")
    } else {
      None
    }
  }
}
