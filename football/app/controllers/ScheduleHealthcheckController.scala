package controllers

import org.scala_tools.time.Imports._

object LiveMatchWatch extends ScheduleWatch("Live match schedule", 2.minutes)
object CompetitionWatch extends ScheduleWatch("Competition schedule", 20.minutes)


object ScheduleHealthcheckController extends ScheduleWatchController(Seq(LiveMatchWatch, CompetitionWatch))
