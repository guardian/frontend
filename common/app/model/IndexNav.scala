package model

import services.{KeywordAlphaIndexAutoRefresh, ContributorAlphaIndexAutoRefresh}

case class SectionLink(zone: String, title: String, breadcrumbTitle: String, href: String)
case class NavItem(name: SectionLink, links: Seq[SectionLink] = Nil)

object IndexNav {
  private def tagIndexSignposting(tagType: String, navTitle: String)(get: => Option[TagIndexListings]) = {
    val sectionRoot = SectionLink(tagType, tagType, navTitle, s"/index/$tagType")

    get match {
      case Some(listings) =>
        NavItem(
          sectionRoot,
          listings.pages map { page =>
            SectionLink(tagType, page.title.toLowerCase, page.title, s"/index/$tagType/${page.id}")
          },
        )

      case None => NavItem(sectionRoot, Nil)
    }
  }

  val contributorsAlpha = tagIndexSignposting("contributors", "Contributors")(ContributorAlphaIndexAutoRefresh.get)

  val keywordsAlpha = tagIndexSignposting("subjects", "Subjects")(KeywordAlphaIndexAutoRefresh.get)
}
