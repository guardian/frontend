package ophan

import org.scalatest.{Matchers, FlatSpec}
import play.api.libs.json.Json

class SurgeUtilsTest extends FlatSpec with Matchers {
  "surgeResultParser" should "extract out results" in {
    val result: Seq[(String, Int)] = SurgeUtils.parse(json)
    result.size should equal(2)

    val result0: (String, Int) = result(0)
    result0._1 should equal("this/is/really/hot")
    result0._2 should equal(1000)
  }

  "surgeResultParser" should "remove the first slash in the url because our content object ids don't have it" in {
    val result: Seq[(String, Int)] = SurgeUtils.parse(json)

    val result0: (String, Int) = result(0)
    result0._1 should equal("this/is/really/hot")
  }

  "surgeLevelProvider" should "return a numerical representation of the surge level" in {
    SurgeUtils.levelProvider(Some(500)) should be (Seq(1, 2, 3, 4))
    SurgeUtils.levelProvider(Some(401)) should be (Seq(1, 2, 3, 4))
    SurgeUtils.levelProvider(Some(301)) should be (Seq(2, 3, 4))
    SurgeUtils.levelProvider(Some(201)) should be (Seq(3, 4))
    SurgeUtils.levelProvider(Some(101)) should be (Seq(4))
    SurgeUtils.levelProvider(Some(99))  should be (Seq(0))
    SurgeUtils.levelProvider(None) should be (Seq(0))
  }

  lazy val jsonString =
    """
      |[{"path":"/this/is/really/hot","pvs-per-min":1000},{"path":"/this/is/2nd/best","pvs-per-min":999}]
    """.stripMargin

  lazy val json = Json.parse(jsonString)
}
