package model.pressed

import com.gu.facia.api.{utils => fapiutils}

final case class Series(name: String, url: String)

object Series {
  def make(series: Option[fapiutils.Series]): Option[Series] = {
    series.map(series => Series(series.name, series.url))
  }
}
