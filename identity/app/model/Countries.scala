package model

import com.gu.i18n.CountryGroup

object Countries {
  val all = CountryGroup.countries.map(_.name)
  def withCustom(maybeCountry: Option[String]): List[String] =
    maybeCountry match {
      case Some(s) if s.isEmpty         => all
      case Some(c) if !(all contains c) => c :: all
      case _                            => all
    }
  val UK = CountryGroup.UK.name
  val US = CountryGroup.US.name
}
