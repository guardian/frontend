package model

import org.scalatest.FlatSpec
import org.scalatest.matchers.ShouldMatchers
import org.joda.time.DateTime
import com.gu.openplatform.contentapi.model.{ Content => ApiContent }
import org.scala_tools.time.Imports._

class ZoneTest extends FlatSpec with ShouldMatchers {

  "Zone" should "which sections are in it" in {
    Zone("books") should be("culture")
  }

  it should "default to 'news'" in {
    Zone("new-section") should be("news")
  }
}