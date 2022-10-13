package dfp

import com.google.api.ads.admanager.axis.utils.v202208.StatementBuilder
import dfp.Reader.read
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class ReaderTest extends AnyFlatSpec with Matchers {

  "load" should "load a single page of results" in {
    val stmtBuilder = new StatementBuilder()
    val result = read[Int](stmtBuilder) { statement =>
      (Array(1, 2, 3, 4, 5), 5)
    }
    result shouldBe Seq(1, 2, 3, 4, 5)
  }

  it should "load multiple pages of results" in {
    val stmtBuilder = new StatementBuilder()
    val result = read[Int](stmtBuilder) { statement =>
      ((1 to 10).toArray, 30)
    }
    result shouldBe Seq.fill[Seq[Int]](3)((1 to 10)).flatten
  }

  it should "cope with a null result" in {
    val stmtBuilder = new StatementBuilder()
    val result = read[Int](stmtBuilder) { statement => (null, 0) }
    result shouldBe empty
  }
}
