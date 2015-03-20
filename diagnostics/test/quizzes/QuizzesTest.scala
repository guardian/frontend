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

  "question Aggregator" should "refuse to add too many answers" in {
    Quizzes.incrementByIndex(Nil, 6) should be(Nil)
    Quizzes.incrementByIndex(Nil, 5) should be(List(0, 0, 0, 0, 0, 1))
  }

  "question Aggregator" should "refuse to add too many answers but preserve existing ones" in {
    Quizzes.incrementByIndex(List(2, 1), 6) should be(List(2, 1))
  }

  "list Aggregator" should "add to the list" in {
    Quizzes.addResultsToList(List(), List(0, 0)) should be(List(List(1), List(1)))
  }

  "list Aggregator" should "do the whole list" in {
    Quizzes.addResultsToList(List(Nil, Nil), List(0, 0)) should be(List(List(1), List(1)))
  }

  "list Aggregator" should "ignore the trailing answers if there are too many" in {
    Quizzes.addResultsToList(List(), List.fill(40)(0)) should be(List.fill(40)(List(1)))
    Quizzes.addResultsToList(List(), List.fill(41)(0)) should be(List.fill(40)(List(1)))
  }

}
