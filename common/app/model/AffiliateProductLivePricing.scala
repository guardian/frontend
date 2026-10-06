package model

import conf.switches.Switches
import conf.{Configuration}

object AffiliateProductLivePricing {
  private val allowList: Map[String, Set[String]] = Map(
    "CODE" -> Set("/thefilter/2025/nov/15/best-christmas-gifts-ideas-filter-uk-2025"),
    "PROD" -> Set.empty,
  )

  def isEnabledForPage(pageUrl: String): Boolean = {
    // Later we will check a flag in the content model and remove the hardcoded list
    val enabledForArticle = allowList
      .getOrElse(if (Configuration.environment.isProd) "PROD" else "CODE", Set.empty)
      .contains(pageUrl)

    enabledForArticle && Switches.AffiliateProductLivePricing.isSwitchedOn
  }
}
