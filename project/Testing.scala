import sbt._
import sbt.Keys._
import sbt.PlayProject._

import sbtassembly.Plugin.AssemblyKeys._
import sbtassembly.Plugin.MergeStrategy
import templemore.xsbt.cucumber.CucumberPlugin
import templemore.xsbt.cucumber.CucumberPlugin._

import scala.io.Source

trait Testing {
  val features = TaskKey[Seq[File]]("features", "Builds a file with BDD features in it")
  def featuresTask = (sources in Test, target, streams) map { (testFiles, targetDir, s) =>
    import s.log

    val Feature = """.*feature\("(.*)"\).*""".r
    val Scenario = """.*scenario\("(.*)".*""".r // TODO tags
    val Given = """.*given\("(.*)"\).*""".r
    val When = """.*when\("(.*)"\).*""".r
    val Then = """.*then\("(.*)"\).*""".r
    val And = """.*and\("(.*)"\).*""".r
    val Info = """.*info\("(.*)"\).*""".r

    testFiles.filter(_.getName.endsWith("FeatureTest.scala")).map { testFile: File =>
      log.info("creating feature file for: " + testFile)
      val name = testFile.getName.replace("FeatureTest.scala", ".feature")
      val featureFile = targetDir / name
      if (featureFile.exists) featureFile.delete()
      featureFile.createNewFile()
      (testFile, featureFile)
    }.map {
      case (source, output) =>
        Source.fromFile(source).getLines().foreach {
          case Feature(message)  => IO.append(output, "Feature: " + message + "\n")
          case Scenario(message) => IO.append(output, "\n\tScenario: " + message + "\n")
          case Given(message)    => IO.append(output, "\t\tGiven " + message + "\n")
          case When(message)     => IO.append(output, "\t\tWhen " + message + "\n")
          case Then(message)     => IO.append(output, "\t\tThen " + message + "\n")
          case And(message)      => IO.append(output, "\t\tAnd " + message + "\n")
          case Info(message)     => IO.append(output, "\t" + message + "\n")
          case line              => Unit
        }
        output
    }
  }

  def integrationTests(name: String, filename: String) = Project(name, file(filename))
    .settings(CucumberPlugin.cucumberSettings: _*)
    .settings(org.sbtidea.SbtIdeaPlugin.ideaSettings: _*)
    .settings(
      libraryDependencies ++= Seq(
        "junit" % "junit" % "4.10",
        "org.seleniumhq.selenium" % "selenium-java" % "2.24.1",
        "junit-addons" % "junit-addons" % "1.4",
        "info.cukes" % "cucumber-core" % "1.0.14",
        "info.cukes" % "cucumber-java" % "1.0.14",
        "info.cukes" % "cucumber-junit" % "1.0.14",
        "info.cukes" % "cucumber-picocontainer" % "1.0.14"
      )
      // TODO - doesn't work - cucumber is an input task
      // (test in Test) <<= (test in Test) dependsOn (cucumber)
    )
}
