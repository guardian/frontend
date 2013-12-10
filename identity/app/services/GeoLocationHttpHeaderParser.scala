package services

import play.api.mvc.RequestHeader


class GeoLocationHttpHeaderParser {
  private val HeaderKeyValueFormat = """([^:]+):([^:]+)""".r

  def apply( request: RequestHeader) : GeoLocationHttpHeader = {
    val geoHeaderOption = request.headers.get("X-GU-ID-Geolocation")

    geoHeaderOption.map { geoHeaderValue =>
      val geoKeyValueMap = geoHeaderValue.split(",").flatMap {
        case HeaderKeyValueFormat(key, value) => Some(key.trim -> value.trim)
        case _ => None
      }.toMap

      GeoLocationHttpHeader(geoKeyValueMap.get("country"), geoKeyValueMap.get("city"), geoKeyValueMap.get("ip"))
    }.getOrElse(GeoLocationHttpHeader(None, None, None))
  }
}

case class GeoLocationHttpHeader(city: Option[String], country: Option[String], ipAddress: Option[String])