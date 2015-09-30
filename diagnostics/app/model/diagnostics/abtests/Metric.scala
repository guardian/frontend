package model.diagnostics.abtests

import common.Logging
import views.support.CamelCase
import conf.switches.Switches.{all => AllSwitches}

import com.google.common.util.concurrent.AtomicDouble
import org.jboss.netty.util.internal.ConcurrentHashMap
import scala.collection.convert.Wrappers

object Metric extends Logging {

  private val pageViews  = Wrappers.JConcurrentMapWrapper(new ConcurrentHashMap[String, AtomicDouble]())
  private val sessions   = Wrappers.JConcurrentMapWrapper(new ConcurrentHashMap[String, AtomicDouble]())

  private lazy val abTests: Seq[String] = {
    AllSwitches filter { _.name.startsWith("ab-") } map { switch => CamelCase.fromHyphenated(switch.name) }
  }

  def incrementPageView(test: String, variant: String) {
    if (abTests.contains(test)) {
      val testCombination = s"$test-$variant"
      pageViews.putIfAbsent(testCombination, new AtomicDouble(0.0))
      pageViews(testCombination).addAndGet(1.0)
    }
  }

  def incrementSession(test: String, variant: String) {
    if (abTests.contains(test)) {
      val testCombination = s"$test-$variant"
      sessions.putIfAbsent(testCombination, new AtomicDouble(0.0))
      sessions(testCombination).addAndGet(1.0)
    }
  }

  def viewsPerSession : Map[String, Double] = {
    // Calculate the ratio of page views to sessions for test variants
    // that have data in both Maps.
    val variants = pageViews.keys.toList intersect sessions.keys.toList

    variants.map( variant => { (variant, pageViews(variant).doubleValue / sessions(variant).doubleValue) } ).toMap
  }

  def reset() {
    pageViews.clear()
    sessions.clear()
  }
}
