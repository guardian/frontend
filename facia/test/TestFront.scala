import com.gu.Box
import controllers.front.Front
import helpers.{FaciaTestData, TestPageFront}

class TestFront extends Front with FaciaTestData {
  val pageFrontAgent = Box[Map[String, TestPageFront]](defaultAgentContents)
}
