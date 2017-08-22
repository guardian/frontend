package navigation

import NavLinks._
import common.Edition
import common.editions

case class NavLink(title: String, url: String, uniqueSection: String = "", longTitle: String = "", iconName: String = "")
case class NavLinkLists(mostPopular: Seq[NavLink], leastPopular: Seq[NavLink] = List())

object NewNavigation {

  trait EditionalisedNavigationSection {
    def name: String

    def uk: NavLinkLists
    def us: NavLinkLists
    def au: NavLinkLists
    def int: NavLinkLists

    def getAllEditionalisedNavLinks(edition: Edition): Seq[NavLink] = edition match {
      case editions.Uk => uk.mostPopular ++ uk.leastPopular
      case editions.Au => au.mostPopular ++ au.leastPopular
      case editions.Us => us.mostPopular ++ us.leastPopular
      case editions.International => int.mostPopular ++ int.leastPopular
    }

    def getEditionalisedSubSectionLinks(edition: Edition): NavLinkLists = edition match {
      case editions.Uk => uk
      case editions.Au => au
      case editions.Us => us
      case editions.International => int
    }
  }

  case object BrandExtensions extends EditionalisedNavigationSection {
    val name = ""

    val uk = NavLinkLists(List(
      jobs.copy(url = jobs.url + "?INTCMP=jobs_uk_web_newheader"),
      dating.copy(url = dating.url + "?INTCMP=soulmates_uk_web_newheader"),
      holidays.copy(url = holidays.url + "?INTCMP=holidays_uk_web_newheader"),
      ukMasterClasses
    ))

    val au = NavLinkLists(List(
      jobs.copy(url = jobs.url + "/landingpage/2868291/jobs-australia-html/?INTCMP=jobs_au_web_newheader"),
      auEvents
    ))

    val us = NavLinkLists(List(
      jobs.copy(url = jobs.url + "?INTCMP=jobs_us_web_newheader")
    ))

    val int = NavLinkLists(List(
      jobs.copy(url = jobs.url + "?INTCMP=jobs_int_web_newheader"),
      dating.copy(url = dating.url + "?INTCMP=soulmates_int_web_newheader"),
      holidays.copy(url = holidays.url + "?INTCMP=holidays_int_web_newheader")
    ))
  }

  case object OtherLinks extends EditionalisedNavigationSection {
    val name = ""

    val uk = NavLinkLists(List(
      apps.copy(url = apps.url + "?INTCMP=apps_uk_web_newheader"),
      video,
      podcasts,
      pictures,
      newsletters,
      todaysPaper,
      observer,
      digitalNewspaperArchive,
      NavLink("professional networks", "/guardian-professional"),
      crosswords
    ))

    val au = NavLinkLists(List(
      apps.copy(url = apps.url + "?INTCMP=apps_au_web_newheader"),
      video,
      podcasts,
      pictures,
      newsletters,
      digitalNewspaperArchive,
      crosswords
    ))

    val us = NavLinkLists(List(
      apps.copy(url = apps.url + "?INTCMP=apps_us_web_newheader"),
      video,
      podcasts,
      pictures,
      newsletters,
      digitalNewspaperArchive,
      crosswords
    ))

    val int = NavLinkLists(List(
      apps.copy(url = apps.url + "?INTCMP=apps_int_web_newheader"),
      video,
      podcasts,
      pictures,
      newsletters,
      todaysPaper,
      observer,
      digitalNewspaperArchive,
      crosswords
    ))
  }
}
