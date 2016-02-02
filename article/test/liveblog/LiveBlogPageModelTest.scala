package liveblog

import org.scalatest.{FlatSpec, Matchers}

class LiveBlogPageModelTest extends FlatSpec with Matchers {

   "LiveBlogPageModel" should "allow 1 block on one page" in {
     val result = LiveBlogPageModel(2, 0, Seq(()))(isRequestedBlock = None, id = _.toString)

     result.map(_.copy(main = Seq())) should be(Some(LiveBlogPageModel(Seq(()), Seq(), NoPage, NoPage, FirstPage)))

   }

  "LiveBlogPageModel" should "allow 3 blocks on one page" in {
    val blocks = Seq.fill(3)(())
    val result = LiveBlogPageModel(2, 0, blocks)(None, _.toString)

    result.map(_.copy(main = Seq())) should be(Some(LiveBlogPageModel(blocks, Seq(), NoPage, NoPage, FirstPage)))

  }

  "LiveBlogPageModel" should "put 4 blocks on two pages (main page)" in {
    val blocks = Seq.fill(4)(()).zipWithIndex.map(_._2).map {
      case x: Int if x < 2 => s"new $x"
      case x: Int => s"old $x"
    }
    val result = LiveBlogPageModel(2, 0, blocks)(None, _.toString)

    val expected = blocks.take(2)

    result.map(_.copy(main = Seq())) should be(Some(LiveBlogPageModel(expected, Seq(), NoPage, BlockPage("old 2"), FirstPage)))

  }

  "LiveBlogPageModel" should "put 4 blocks on two pages - canonical link" in {
    val blocks = Seq.fill(4)(()).zipWithIndex.map(_._2).map {
      case x: Int if x < 2 => s"new $x"
      case x: Int => s"old $x"
    }
    val result = LiveBlogPageModel(2, 0, blocks)(Some(_ == "old 2"), _.toString)

    val expected = blocks.takeRight(2)

    result.map(_.copy(main = Seq())) should be(Some(LiveBlogPageModel(expected, Seq(), FirstPage, NoPage, BlockPage("old 2"))))

  }

  "LiveBlogPageModel" should "put 4 blocks on two pages - link to another block on the page" in {
    val blocks = Seq.fill(4)(()).zipWithIndex.map(_._2).map {
      case x: Int if x < 2 => s"new $x"
      case x: Int => s"old $x"
    }
    val result = LiveBlogPageModel(2, 0, blocks)(Some(_ == "old 3"), _.toString)

    val expected = blocks.takeRight(2)

    result.map(_.copy(main = Seq())) should be(Some(LiveBlogPageModel(expected, Seq(), FirstPage, NoPage, BlockPage("old 2"))))

  }

  "LiveBlogPageModel" should "put 5 blocks on two pages (main page)" in {
    val blocks = Seq.fill(5)(()).zipWithIndex.map(_._2)
    val result = LiveBlogPageModel(2, 0, blocks)(None, _.toString)

    val expected = blocks.take(3)

    result.map(_.copy(main = Seq())) should be(Some(LiveBlogPageModel(expected, Seq(), NoPage, BlockPage("3"), FirstPage)))

  }

  "LiveBlogPageModel" should "put 5 blocks on two pages (block 3 from oldest page)" in {
    val blocks = Seq.fill(5)(()).zipWithIndex.map(_._2)
    val result = LiveBlogPageModel(2, 0, blocks)(Some(_ == 3), _.toString)

    val expected = blocks.takeRight(2)

    result.map(_.copy(main = Seq())) should be(Some(LiveBlogPageModel(expected, Seq(), FirstPage, NoPage, BlockPage("3"))))

  }

  "LiveBlogPageModel" should "put 6 blocks on 3 pages (main page)" in {
    val blocks = Seq.fill(6)(()).zipWithIndex.map(_._2)
    val result = LiveBlogPageModel(2, 0, blocks)(None, _.toString)

    val expected = blocks.take(2)

    result.map(_.copy(main = Seq())) should be(Some(LiveBlogPageModel(expected, Seq(), NoPage, BlockPage("2"), FirstPage)))

  }

  "LiveBlogPageModel" should "put 6 blocks on 3 pages (middle page)" in {
    val blocks = Seq.fill(6)(()).zipWithIndex.map(_._2)
    val result = LiveBlogPageModel(2, 0, blocks)(Some(_ == 2), _.toString)

    val expected = blocks.take(4).takeRight(2)

    result.map(_.copy(main = Seq())) should be(Some(LiveBlogPageModel(expected, Seq(), FirstPage, BlockPage("4"), BlockPage("2"))))

  }

  "LiveBlogPageModel" should "put 6 blocks on 3 pages (oldest page)" in {
    val blocks = Seq.fill(6)(()).zipWithIndex.map(_._2)
    val result = LiveBlogPageModel(2, 0, blocks)(Some(_ == 4), _.toString)

    val expected = blocks.takeRight(2)

    result.map(_.copy(main = Seq())) should be(Some(LiveBlogPageModel(expected, Seq(), BlockPage("2"), NoPage, BlockPage("4"))))

  }

//  // should really test the preload and timeline generation too

}
