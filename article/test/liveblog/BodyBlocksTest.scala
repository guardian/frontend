package liveblog

import org.jsoup.Jsoup
import org.jsoup.nodes.{Document, Element}
import org.scalatest.{FlatSpec, Matchers}

import scala.collection.JavaConversions._

class BodyBlocksTest extends FlatSpec with Matchers {

   "BodyBlocks" should "allow 1 block on one page" in {
     val result = BodyBlocks(2, 0)(Seq(()), None)

     result should be(Some(BodyBlocks(Seq(()), Seq(), NoPage, None)))

   }

  "BodyBlocks" should "allow 3 blocks on one page" in {
    val blocks = Seq.fill(3)(())
    val result = BodyBlocks(2, 0)(blocks, None)

    result should be(Some(BodyBlocks(blocks, Seq(), NoPage, None)))

  }

  "BodyBlocks" should "put 4 blocks on two pages (main page)" in {
    val blocks = Seq.fill(4)(()).zipWithIndex.map(_._2).map {
      case x: Int if x < 2 => s"new $x"
      case x: Int => s"old $x"
    }
    val result = BodyBlocks(2, 0)(blocks, None)

    val expected = blocks.take(2)

    result should be(Some(BodyBlocks(expected, Seq(), NoPage, Some(1))))

  }

  "BodyBlocks" should "put 4 blocks on two pages (page 1 - oldest)" in {
    val blocks = Seq.fill(4)(()).zipWithIndex.map(_._2).map {
      case x: Int if x < 2 => s"new $x"
      case x: Int => s"old $x"
    }
    val result = BodyBlocks(2, 0)(blocks, Some(1))

    val expected = blocks.takeRight(2)

    result should be(Some(BodyBlocks(expected, Seq(), FirstPage, None)))

  }

  "BodyBlocks" should "put 5 blocks on two pages (main page)" in {
    val blocks = Seq.fill(5)(()).zipWithIndex.map(_._2)
    val result = BodyBlocks(2, 0)(blocks, None)

    val expected = blocks.take(3)

    result should be(Some(BodyBlocks(expected, Seq(), NoPage, Some(1))))

  }

  "BodyBlocks" should "put 5 blocks on two pages (page 1 - oldest)" in {
    val blocks = Seq.fill(5)(()).zipWithIndex.map(_._2)
    val result = BodyBlocks(2, 0)(blocks, Some(1))

    val expected = blocks.takeRight(2)

    result should be(Some(BodyBlocks(expected, Seq(), FirstPage, None)))

  }

  // should really test the preload and timeline generation too

}
