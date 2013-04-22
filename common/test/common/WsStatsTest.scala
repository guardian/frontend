package test

import org.scalatest.FlatSpec
import org.scalatest.matchers.ShouldMatchers
import common.WsStats
import common._

private object Fake extends FakeApp

class WsStatsTest extends FlatSpec with ShouldMatchers {

  "WsStats" should "not change its implementation" in Fake {
    // WsStats uses reflection to find some hidden stats.
    // If the implementation changes the compiler will not warn us
    // but this test will break

    WsStats()

  }
}
