package model

import com.gu.i18n.CountryGroup

object Countries {
  val all = CountryGroup.countries.map(_.name) 
  val UK = CountryGroup.UK.name
  val US = CountryGroup.US.name
}
