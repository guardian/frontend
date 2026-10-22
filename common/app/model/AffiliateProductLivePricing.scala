package model

import conf.switches.Switches
import conf.{Configuration}

object AffiliateProductLivePricing {
  private val allowList: Map[String, Set[String]] = Map(
    "CODE" -> Set(
      "/thefilter/2025/nov/15/best-christmas-gifts-ideas-filter-uk-2025",
      "/thefilter/2026/oct/15/i-love-bass-bass-bass-and-bass-dj-paulette-carl-craig-and-more-on-the-best-dj-headphones",
    ),
    "PROD" -> Set(
      "/thefilter/2025/feb/20/best-dj-headphones",
      "/thefilter/2025/oct/24/tips-to-make-mornings-better",
      "/thefilter/2025/apr/18/best-pressure-washers-cleaners-uk",
      "/thefilter/2025/jul/04/best-cool-boxes-bags-uk",
      "/thefilter-us/2026/apr/23/what-readers-bought-april",
      "/thefilter-us/2026/jun/20/summer-running-gear-essentials",
    ),
  )

  def isEnabledForPage(pageUrl: String): Boolean = {
    // Later we will check a flag in the content model and remove the hardcoded list
    val enabledForArticle = allowList
      .getOrElse(if (Configuration.environment.isProd) "PROD" else "CODE", Set.empty)
      .contains(pageUrl)

    enabledForArticle && Switches.AffiliateProductLivePricing.isSwitchedOn
  }
}
