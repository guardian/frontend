package liveblog

import org.jsoup.Jsoup
import org.jsoup.nodes.{Document, Element}
import org.scalatest.{FlatSpec, Matchers}

import scala.collection.JavaConversions._

class BodyBlocksTest extends FlatSpec with Matchers {

   "BodyBlocks" should "allow 1 block on one page" in {
     val result = BodyBlocks(Seq(()), None)

     result should be(Some(BodyBlocks(Seq(()), NoPage, None)))

   }

  "BodyBlocks" should "allow 19 blocks on one page" in {
    val blocks = Seq.fill(19)(())
    val result = BodyBlocks(blocks, None)

    result should be(Some(BodyBlocks(blocks, NoPage, None)))

  }

  "BodyBlocks" should "put 20 blocks on two pages (main page)" in {
    val blocks = Seq.fill(20)(()).zipWithIndex.map(_._2).map {
      case x: Int if (x < 10) => s"new $x"
      case x: Int => s"old $x"
    }
    val result = BodyBlocks(blocks, None)

    val expected = blocks.take(10)

    result should be(Some(BodyBlocks(expected, NoPage, Some(1))))

  }

  "BodyBlocks" should "put 20 blocks on two pages (page 1 - oldest)" in {
    val blocks = Seq.fill(20)(()).zipWithIndex.map(_._2).map {
      case x: Int if (x < 10) => s"new $x"
      case x: Int => s"old $x"
    }
    val result = BodyBlocks(blocks, Some(1))

    val expected = blocks.takeRight(10)

    result should be(Some(BodyBlocks(expected, FirstPage, None)))

  }

  "BodyBlocks" should "put 21 blocks on two pages (main page)" in {
    val blocks = Seq.fill(21)(()).zipWithIndex.map(_._2)
    val result = BodyBlocks(blocks, None)

    val expected = blocks.take(11)

    result should be(Some(BodyBlocks(expected, NoPage, Some(1))))

  }

  "BodyBlocks" should "put 21 blocks on two pages (page 1 - oldest)" in {
    val blocks = Seq.fill(21)(()).zipWithIndex.map(_._2)
    val result = BodyBlocks(blocks, Some(1))

    val expected = blocks.takeRight(10)

    result should be(Some(BodyBlocks(expected, FirstPage, None)))

  }

}
