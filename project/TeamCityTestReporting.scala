package com.gu

import sbt._
import sbt.testing.{TestSelector, Event, OptionalThrowable, Status}

import Keys._
import java.io.{PrintWriter, StringWriter}

object TeamCityTestReporting extends Plugin {
  override def settings = Seq(
    testListeners ++= TeamCityTestListener.ifRunningUnderTeamCity
  )
}

class TeamCityTestListener extends TestReportListener {
  /** called for each class or equivalent grouping */
  def startGroup(name: String) {
    // we can't report to teamcity that a test group has started here,
    // because even if parallel test execution is disabled there may be multiple
    // projects running tests from different projects at the same time.
    // So if you tell TC that a test group has started, the tests from
    // different projects will get mixed up.
  }

  def nicelyFormatException(t: OptionalThrowable) = {
    if (t.isDefined) {
      val w = new StringWriter
      val p = new PrintWriter(w)
      t.get.printStackTrace(p)
      w.toString
    } else ""
  }

  /** called for each test method or equivalent */
  def testEvent(event: TestEvent) {
    for (e: Event <- event.detail) {

      // TC seems to get a bit upset if you start a test while one is already running
      // so a nasty bit of synchronisation here to stop that happening
      synchronized {

        val testName = e.selector match {
          case s: TestSelector => s.testName
          // I can't think when you would have anything other than a TestSelector, but
          // try to do something vaguely useful in that case
          case _ => e.fullyQualifiedName
        }

        // this is a lie: the test has already been executed and started by this point,
        // but sbt doesn't send an event when test starts
        teamcityReport("testStarted", "name" -> testName)

        e.status match {
          case Status.Success => // nothing extra to report
          case Status.Error | Status.Failure =>
            teamcityReport("testFailed",
              "name" -> testName,
              "details" -> nicelyFormatException(e.throwable)
            )
          case Status.Skipped | Status.Ignored | Status.Pending=>
            teamcityReport("testIgnored", "name" -> testName)
          case Status.Canceled =>
            // I can't think how this would happen and no appropriate message for Teamcity
            println(s"Test:$testName was cancelled")
        }

        teamcityReport("testFinished", "name" -> testName)
      }
    }
  }


  /** called if there was an error during test */
  def endGroup(name: String, t: Throwable) { }
  /** called if test completed */
  def endGroup(name: String, result: TestResult.Value) { }


  // http://confluence.jetbrains.net/display/TCD65/Build+Script+Interaction+with+TeamCity
  def tidy(s: String) = s
    .replace("|", "||")
    .replace("'", "|'")
    .replace("\n", "|n")
    .replace("\r", "|r")
    .replace("\u0085", "|x")
    .replace("\u2028", "|l")
    .replace("\u2029", "|p")
    .replace("[", "|[")
    .replace("]", "|]")

  private def teamcityReport(messageName: String, attributes: (String, String)*) {
    val attributeString = attributes.map {
      case (k, v) => s"$k='${tidy(v)}'"
    }.mkString(" ")
    println(s"##teamcity[$messageName $attributeString]")
  }
}

object TeamCityTestListener {
  private lazy val teamCityProjectName = Option(System.getenv("TEAMCITY_PROJECT_NAME"))
  lazy val ifRunningUnderTeamCity = teamCityProjectName.map(ignore => new TeamCityTestListener).toSeq
}