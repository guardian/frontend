package quizzes

import model.diagnostics.javascript.Metric
import model.diagnostics.quizzes.Quizzes
import org.scalatest.{BeforeAndAfterEach, DoNotDiscover, FlatSpec, Matchers}

class QuizzesTest extends FlatSpec with Matchers with BeforeAndAfterEach {

  "question Aggregator" should "add unseen buckets in the first place" in {
    Quizzes.incrementByIndex(Nil, 0) should be(List(1))
    Quizzes.incrementByIndex(Nil, 1) should be(List(0, 1))
  }

  "question Aggregator" should "add unseen buckets once we've got going" in {
    Quizzes.incrementByIndex(List(2), 1) should be(List(2, 1))
    Quizzes.incrementByIndex(List(2), 2) should be(List(2, 0, 1))
  }

  "question Aggregator" should "add to an existing bucket" in {
    Quizzes.incrementByIndex(List(2, 1), 0) should be(List(3, 1))
    Quizzes.incrementByIndex(List(2, 1), 1) should be(List(2, 2))
  }

  "list Aggregator" should "add to the list" in {
    Quizzes.addResultsToList(List(), List(0, 0)) should be(List(List(1), List(1)))
  }

  "list Aggregator" should "do the whole list" in {
    Quizzes.addResultsToList(List(Nil, Nil), List(0, 0)) should be(List(List(1), List(1)))
  }

}
