package feed

import feed.MostPopularFromFacebookAgent.OphanOrderSorter
import model.Article
import org.scalatest.matchers.ShouldMatchers
import org.scalatest.FlatSpec
import org.scalatest.mock.MockitoSugar


import org.mockito.Mockito._

class OphanOrderSorterTest extends FlatSpec with ShouldMatchers with MockitoSugar {

  "OphanOrderSorter" should "sort ContentAPI objects based on the original Ophan list" in {
    val ophanList = Seq("A", "B", "C", "D", "E", "F", "G", "H")
    val a1 = mock[Article]
    when(a1.id) thenReturn "G"
    when(a1.toString) thenReturn "G"
    val a2 = mock[Article]
    when(a2.id) thenReturn "A"
    when(a2.toString) thenReturn "A"
    val a3 = mock[Article]
    when(a3.id) thenReturn "D"
    when(a3.toString) thenReturn "D"
    val a4 = mock[Article]
    when(a4.id) thenReturn "H"
    when(a4.toString) thenReturn "H"
    val a5 = mock[Article]
    when(a5.id) thenReturn "F"
    when(a5.toString) thenReturn "F"
    val a6 = mock[Article]
    when(a6.id) thenReturn "C"
    when(a6.toString) thenReturn "C"
    val a7 = mock[Article]
    when(a7.id) thenReturn "E"
    when(a7.toString) thenReturn "E"
    val a8 = mock[Article]
    when(a8.id) thenReturn "B"
    when(a8.toString) thenReturn "B"
    val contentApiList = Seq(a1, a2, a3, a4, a5, a6, a7, a8)

    val sorted = OphanOrderSorter(ophanList, contentApiList)
    sorted should be(Seq(a2, a8, a6, a3, a7, a5, a1, a4))
  }

}
