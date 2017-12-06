package navigation

import NavLinks._
import common.Edition
import common.editions

object NewNavigation {

  trait EditionalisedNavigationSection {
    def name: String

    def uk: List[NavLink]
    def us: List[NavLink]
    def au: List[NavLink]
    def int: List[NavLink]

    def getEditionalisedNavLinks(edition: Edition): List[NavLink] = edition match {
      case editions.Uk => uk
      case editions.Au => au
      case editions.Us => us
      case editions.International => int
    }
  }

  case object BrandExtensions extends EditionalisedNavigationSection {
    val name = ""

    val uk = List(
      jobs.copy(url = jobs.url + "?INTCMP=jobs_uk_web_newheader"),
      dating.copy(url = dating.url + "?INTCMP=soulmates_uk_web_newheader"),
      holidays.copy(url = holidays.url + "?INTCMP=holidays_uk_web_newheader"),
      ukMasterClasses
    )

    val au = List(
      jobs.copy(url = jobs.url + "/landingpage/2868291/jobs-australia-html/?INTCMP=jobs_au_web_newheader"),
      auEvents
    )

    val us = List(
      jobs.copy(url = jobs.url + "?INTCMP=jobs_us_web_newheader")
    )

    val int = List(
      jobs.copy(url = jobs.url + "?INTCMP=jobs_int_web_newheader"),
      dating.copy(url = dating.url + "?INTCMP=soulmates_int_web_newheader"),
      holidays.copy(url = holidays.url + "?INTCMP=holidays_int_web_newheader")
    )
  }
}
