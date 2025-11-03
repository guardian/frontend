package model.abtests

import common.Box

object AbTests {
  private val abTests = Box[Map[String, Seq[String]]](Map.empty)

  def update(testVariants: Map[String, Seq[String]]): Unit = {
    abTests.send(testVariants)
  }
}
