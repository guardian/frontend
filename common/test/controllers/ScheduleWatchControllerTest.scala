package controllers

import org.scalatest.FlatSpec
import org.scalatest.matchers.ShouldMatchers
import conf.CommonSwitches.ScheduleWatchSwitch
import org.scala_tools.time.Imports._
import play.api.test.Helpers._
import test.Fake
import test.TestRequest

class ScheduleWatchControllerTest extends FlatSpec with ShouldMatchers {


  "ScheduleWatchController" should "return OK if switch is off" in Fake{

    ScheduleWatchSwitch.switchOff()

    val watch = new ScheduleWatch("test", 10.minutes)
    watch.agent.send(DateTime.now - 20.minutes)

    val result = new ScheduleWatchController(Seq(watch)).render()(TestRequest())

    status(result) should be (200)
  }

  it should "return OK if switch is not stale" in Fake{

    ScheduleWatchSwitch.switchOn()

    val watch = new ScheduleWatch("test", 30.minutes)
    watch.agent.send(DateTime.now - 20.minutes)

    val result = new ScheduleWatchController(Seq(watch)).render()(TestRequest())

    status(result) should be (200)
  }

  it should "return Error if switch is stale" in Fake{

    ScheduleWatchSwitch.switchOn()

    val staleWatch = new ScheduleWatch("test", 10.minutes)
    staleWatch.agent.send(DateTime.now - 20.minutes)

    val freshWatch = new ScheduleWatch("not stale", 6.hours)

    val result = new ScheduleWatchController(Seq(freshWatch, staleWatch)).render()(TestRequest())

    status(result) should be (500)
  }
}
