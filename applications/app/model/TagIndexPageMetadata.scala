package model

import common.{SectionLink, NavItem}
import services.{KeywordAlphaIndexAutoRefresh, ContributorAlphaIndexAutoRefresh}

object IndexNav {
  private def tagIndexSignposting(tagType: String, navTitle: String)(get: => Option[TagIndexListings]) = {
    val sectionRoot = SectionLink(tagType, tagType, navTitle, s"/index/$tagType")

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

  val contributorsAlpha = tagIndexSignposting("contributors", "Contributors")(ContributorAlphaIndexAutoRefresh.get)

  val keywordsAlpha = tagIndexSignposting("subjects", "Subjects")(KeywordAlphaIndexAutoRefresh.get)
}

trait TagIndexPageMetaData extends MetaData {
  val page: String

  val tagType: String

  val indexFolder: String

  override def id: String = s"index/$indexFolder/$page"

  override def section: String = tagType

  override def analyticsName: String = tagType

  override def webTitle: String = page.capitalize
}

class SubjectIndexPageMetaData(val page: String) extends TagIndexPageMetaData {
  override val tagType: String = "keywords"

  override val indexFolder: String = "subjects"

  override def customSignPosting = Some(IndexNav.keywordsAlpha)
}

class ContributorsIndexPageMetaData(val page: String) extends TagIndexPageMetaData {
  override val tagType: String = "contributors"

  override val indexFolder: String = "contributors"

  override def customSignPosting = Some(IndexNav.contributorsAlpha)
}
