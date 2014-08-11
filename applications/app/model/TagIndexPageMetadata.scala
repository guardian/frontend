package model

import common.{SectionLink, NavItem}
import services.{KeywordAlphaIndexAutoRefresh, ContributorAlphaIndexAutoRefresh}

object IndexNav {
  private def tagIndexSignposting(tagType: String)(get: => Option[TagIndexListings]) = {
    val sectionRoot = SectionLink(tagType, tagType, tagType.capitalize, s"/index/$tagType")

    get match {
      case Some(listings) => NavItem(
        sectionRoot,
        listings.pages map { page =>
          SectionLink(tagType, page.title.toLowerCase, page.title, s"/index/$tagType/${page.id}")
        }
      )

      case None => NavItem(sectionRoot, Nil)
    }
  }

  val contributorsAlpha = tagIndexSignposting("contributors")(ContributorAlphaIndexAutoRefresh.get)

  val keywordsAlpha = tagIndexSignposting("keywords")(KeywordAlphaIndexAutoRefresh.get)
}

trait TagIndexPageMetaData extends MetaData {
  val page: String

  val tagType: String

  override def id: String = s"index/$tagType/$page"

  override def section: String = tagType

  override def analyticsName: String = tagType

  override def webTitle: String = page.capitalize
}

class KeywordIndexPageMetaData(val page: String) extends TagIndexPageMetaData {
  override val tagType: String = "keywords"

  override def customSignPosting = Some(IndexNav.keywordsAlpha)
}

class ContributorsIndexPageMetaData(val page: String) extends TagIndexPageMetaData {
  override val tagType: String = "contributors"

  override def customSignPosting = Some(IndexNav.contributorsAlpha)
}
