package model.quality

import services.S3

object QualityData extends S3{
    override lazy val bucket = "omniture-dashboard"

    def getReport(key: String): Option[String] = {
      get(key)
    }
}
