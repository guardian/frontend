package model

import common.NavItem

/** Custom overrides for the sign posting logic on Facia pages.
  *
  * This is currently used for the top level index listings, which are editorially curated using Facia tool, so that we
  * can display foremost our most popular contributors & subjects.
  *
  * For the nav, we list the full A-Z pages available.
  */
object FaciaSignpostingOverrides {
  def apply(id: String): Option[NavItem] = id match {
    case "index/contributors" => Some(IndexNav.contributorsAlpha)
    case "index/subjects" => Some(IndexNav.keywordsAlpha)
    case _ => None
  }
}
