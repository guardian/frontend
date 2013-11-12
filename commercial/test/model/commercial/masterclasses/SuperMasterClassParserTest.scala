package model.commercial.masterclasses

import org.scalatest.Matchers
import org.scalatest.FlatSpec
import common.ExecutionContexts

import scala.concurrent.{Await, Future}
import scala.language.postfixOps
import concurrent.duration._

// This is a sanity check test. Run only when applicable.
class SuperMasterClassParserTest extends FlatSpec with Matchers with ExecutionContexts {
  ignore  should "Be able to parse everything out of the EventBrite feed" in {
      val futureChicken: Future[Seq[MasterClass]] = MasterClassesApi.getAll

      val events = Await.result(futureChicken, 30 seconds)

    events.size should be (3)
    events.exists( _.id == "8996505791") should be (true)
    events.exists( _.id == "8956345671") should be (true)
    events.exists( _.id == "9205787759") should be (true)
  }
}