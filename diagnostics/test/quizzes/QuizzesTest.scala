package quizzes

import model.diagnostics.javascript.Metric
import model.diagnostics.quizzes.Quizzes
import org.scalatest.{BeforeAndAfterEach, DoNotDiscover, FlatSpec, Matchers}

@DoNotDiscover class QuizzesTest extends FlatSpec with Matchers with BeforeAndAfterEach {

  "Aggregator" should "add unseen buckets" in {
    Quizzes.incrementByIndex(Nil, 0) should be(List(1))
  }

}
