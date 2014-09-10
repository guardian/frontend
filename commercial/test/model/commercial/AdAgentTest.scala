package model.commercial

import java.lang.management.{MemoryPoolMXBean, ManagementFactory}
import java.util

import org.scalatest.{Matchers, FlatSpec}
import common.ExecutionContexts

class AdAgentTest extends FlatSpec with Matchers with ExecutionContexts {

  private val ad = new Ad {
    def isTargetedAt(segment: Segment) = segment.context.section.isEmpty
  }

  private val fallbackAds = Seq(
    new Ad {
      def isTargetedAt(segment: Segment) = true
    },
    new Ad {
      def isTargetedAt(segment: Segment) = true
    }
  )

  private val adAgent = new BaseAdAgent[Ad] {
    override def defaultAds = fallbackAds

    def currentAds = Seq(ad)

    protected def updateCurrentAds(ads: Seq[Ad]) = {}
  }

  "isTargetedAt" should "match ads for a repeat visitor" in {
    val segment = Segment(Context(None, Nil), Seq("repeat"))

    val ads = adAgent.adsTargetedAt(segment)

    ads should be(Seq(ad))
  }

  "isTargetedAt" should "fall back to a default seq if no there matching ads for a repeat visitor" in {
    val segment = Segment(Context(Some("section"), Nil), Seq("repeat"))

    val ads = adAgent.adsTargetedAt(segment)

    ads should be(fallbackAds)
  }

  "This test" should "allow me to see the memory usage of this thing" in {
    import collection.JavaConversions._
    val iterator: util.Iterator[MemoryPoolMXBean] = ManagementFactory.getMemoryPoolMXBeans.iterator()

    iterator.foreach { item =>
      val name = item.getName
      val usage = item.getUsage
      val typp = item.getType
      println("### Hello world")
      println(s"$name ($typp): $usage")
    }
  }
}
