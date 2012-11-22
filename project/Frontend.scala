//import com.gu.deploy.PlayArtifact._
//import com.gu.deploy.PlayAssetHash._
//import com.typesafe.sbtscalariform.ScalariformPlugin._
import io.Source
import org.sbtidea.SbtIdeaPlugin._
import sbt._
import Keys._
import play.Project._
//import sbtassembly.Plugin.AssemblyKeys._
//import sbtassembly.Plugin.MergeStrategy
import com.gu.SbtJshintPlugin
import com.gu.SbtJshintPlugin._
import templemore.xsbt.cucumber.CucumberPlugin
import templemore.xsbt.cucumber.CucumberPlugin._

object Frontend extends Build with Prototypes {

  val version = "1-SNAPSHOT"

  // jasmine project
  val jasmine = Project("jasmine", file("integration-tests")//,
//      settings = Defaults.defaultSettings ++ CucumberPlugin.cucumberSettings ++ 
//      Seq (
//        CucumberPlugin.cucumberFeaturesDir := new File("./integration-tests/src/test/resources/com/gu/test/common.feature")
//      )
    )
  	.settings(
  	  libraryDependencies ++= Seq(
		  "junit" % "junit" % "4.10",
	      "org.seleniumhq.selenium" % "selenium-java" % "2.24.1",
	      "info.cukes" % "cucumber-core" % "1.0.14",
	      "info.cukes" % "cucumber-java" % "1.0.14",
	      "info.cukes" % "cucumber-junit" % "1.0.14",
	      "info.cukes" % "cucumber-picocontainer" % "1.0.14"
	  )
  	  // TODO - doesn't work - cucumber is an input task
  	  // (test in Test) <<= (test in Test) dependsOn (cucumber)
  	)
	.settings(ideaSettings: _*)
  	
  val common = library("common")//.dependsOn(jasmine % "test->test")
  
  val commonWithTests = common % "test->test;compile->compile"

  val front = application("front").dependsOn(commonWithTests)
  val article = application("article").dependsOn(commonWithTests)
  val section = application("section").dependsOn(commonWithTests)
  val tag = application("tag").dependsOn(commonWithTests)
  val gallery = application("gallery").dependsOn(commonWithTests)
  val video = application("video").dependsOn(commonWithTests)
  val coreNavigation = application("core-navigation").dependsOn(commonWithTests)

  val router = application("router").dependsOn(commonWithTests)
  val diagnostics = application("diagnostics").dependsOn(commonWithTests)

  val football = application("football").dependsOn(commonWithTests).settings(
      libraryDependencies += "com.gu" %% "pa-client" % "2.4"
  )

  val dev = application("dev-build")
    .dependsOn(front)
    .dependsOn(article)
    .dependsOn(section)
    .dependsOn(tag)
    .dependsOn(video)
    .dependsOn(gallery)
    .dependsOn(football)
    .dependsOn(coreNavigation)
    .dependsOn(router)
    .dependsOn(diagnostics)

    
  val main = root().aggregate(
    common, front, article, section, tag, video, gallery, football, coreNavigation, router, diagnostics, dev, jasmine
  )
  
}

trait Prototypes {

  val features = TaskKey[Seq[File]]("features", "Builds a file with BDD features in it")

  def featuresTask = (sources in Test, target, streams) map { (testFiles, targetDir, s) =>

    import s.log

    val Feature = """.*feature\("(.*)"\).*""".r
    val Scenario = """.*scenario\("(.*)".*""".r  // TODO tags
    val Given = """.*given\("(.*)"\).*""".r
    val When = """.*when\("(.*)"\).*""".r
    val Then = """.*then\("(.*)"\).*""".r
    val And = """.*and\("(.*)"\).*""".r
    val Info = """.*info\("(.*)"\).*""".r

    testFiles.filter(_.getName.endsWith("FeatureTest.scala")).map{ testFile: File =>
      log.info("creating feature file for: " + testFile)
      val name = testFile.getName.replace("FeatureTest.scala", ".feature")
      val featureFile = targetDir / name
      if (featureFile.exists) featureFile.delete()
      featureFile.createNewFile()
      (testFile, featureFile)
    }.map{ case(source, output) =>
      Source.fromFile(source).getLines().foreach{
        case Feature(message) => IO.append(output, "Feature: " + message + "\n")
        case Scenario(message) => IO.append(output, "\n\tScenario: " + message + "\n")
        case Given(message) => IO.append(output, "\t\tGiven " + message + "\n")
        case When(message) => IO.append(output, "\t\tWhen " + message + "\n")
        case Then(message) => IO.append(output, "\t\tThen " + message + "\n")
        case And(message) => IO.append(output, "\t\tAnd " + message + "\n")
        case Info(message) => IO.append(output, "\t" + message + "\n")
        case line => Unit
      }
      output
    }
  }

  val version: String

  def root() = Project("root", base = file("."))
    .settings(ideaSettings: _*)
    .settings(
      parallelExecution in Global := false
    )

  def base(name: String) = play.Project(name, version, path = file(name))
  	.settings(requireJsConfiguration: _*)
    .settings(jshintSettings:_*)
//    .settings(scalariformSettings: _*)
//    .settings(playAssetHashDistSettings: _*)
    .settings(
      scalaVersion := "2.9.2",

      maxErrors := 20,
      javacOptions := Seq("-g", "-source", "1.6", "-target", "1.6", "-encoding", "utf8"),
      scalacOptions := Seq("-unchecked", "-optimise", "-deprecation", "-Xcheckinit", "-encoding", "utf8"),

      ivyXML :=
        <dependencies>
          <exclude org="commons-logging"><!-- Conflicts with jcl-over-slf4j in Play. --></exclude>
          <exclude org="org.springframework"><!-- Because I don't like it. --></exclude>
        </dependencies>,

      organization := "com.gu",

      resolvers := Seq(
        "Guardian Github Releases" at "http://guardian.github.com/maven/repo-releases",
        Resolver.url("Typesafe Ivy Releases", url("http://repo.typesafe.com/typesafe/ivy-releases"))(Resolver.ivyStylePatterns),
        "JBoss Releases" at "http://repository.jboss.org/nexus/content/repositories/releases",
        "Typesafe repository" at "http://repo.typesafe.com/typesafe/releases/",
        "Akka" at "http://repo.akka.io/releases"
      ),

      libraryDependencies ++= Seq(
        "org.scalatest" %% "scalatest" % "1.8" % "test"
      ),
	  
      // Use ScalaTest https://groups.google.com/d/topic/play-framework/rZBfNoGtC0M/discussion
      testOptions in Test := Nil,

      // Copy unit test resources https://groups.google.com/d/topic/play-framework/XD3X6R-s5Mc/discussion
      unmanagedClasspath in Test <+= (baseDirectory) map { bd => Attributed.blank(bd / "test") },

      jshintFiles <+= baseDirectory { base =>
        (base / "app" / "assets" / "javascripts" ** "*.js") --- (base / "app" / "assets" / "javascripts" / "vendor" ** "*.js") 
      },

      jshintOptions <+= (baseDirectory) { base =>
        (base.getParentFile / "resources" / "jshint_conf.json")
      },

      (test in Test) <<= (test in Test) dependsOn (jshint),
      
      templatesImport ++= Seq(
        "common._",
        "model._",
        "views._",
        "views.support._",
        "conf._"
      )
    )

  val requireJsConfiguration = Seq(
    //effectively disables built in Play javascript compiler
//    javascriptEntryPoints <<= (sourceDirectory in Compile)(base => (base / "assets" ** "*.none")),
      requireJs += "main.js"
    // require js settings
//    buildProfile in (Compile, requireJs) := (
//      ("baseUrl" -> "../../common/app/assets/javascripts") ~
//	  ("out" -> "../main/public/javascripts/bootstraps/article.js") ~
//	  ("name" -> "bootstraps/article") ~
//	  ("paths" ->
//	    ("bonzo"        -> "vendor/bonzo-1.2.1") ~
//	    ("reqwest"      -> "vendor/reqwest-0.4.5") ~
//	    ("qwery"        -> "vendor/qwery-3.3.11") ~
//	    ("bean"         -> "vendor/bean-0.4.11-1") ~
//	    ("domReady"     -> "vendor/domReady-2.0.1") ~
//	    ("EventEmitter" -> "vendor/EventEmitter-3.1.5")
//      ) ~
//      ("optimize" -> "uglify")
//	),
//	resourceGenerators in Compile <+=  requireJs in Compile
  )

  def library(name: String) = base(name).settings(
//    staticFilesPackage := "frontend-static",
    libraryDependencies ++= Seq(
      "com.gu" % "management-play_2.9.1" % "5.19",
      "com.gu" % "management-logback_2.9.1" % "5.19",
      "com.gu" % "configuration_2.9.1" % "3.7",
      "com.gu.openplatform" %% "content-api-client" % "1.17",

      "com.typesafe.akka" % "akka-agent" % "2.0.2",
      "commons-io" % "commons-io" % "2.4",
      "net.sf.uadetector" % "uadetector-resources" % "2012.08",
      "net.sf.opencsv" % "opencsv" % "2.3",
      "org.scala-tools.time" % "time_2.9.1" % "0.5",
      "com.googlecode.htmlcompressor" % "htmlcompressor" % "1.4",
      "com.yahoo.platform.yui" % "yuicompressor" % "2.4.6",

      "org.codehaus.jackson" % "jackson-core-asl" % "1.9.6",
      "org.codehaus.jackson" % "jackson-mapper-asl" % "1.9.6",
      "org.jsoup" % "jsoup" % "1.6.3",
      "org.jboss.dna" % "dna-common" % "0.6"
    )
  )

  def application(name: String) = base(name).settings(
    features <<= featuresTask//,
//    staticFilesPackage := "frontend-static",
//    executableName := "frontend-%s" format  name,
//    jarName in assembly <<= (executableName) { "%s.jar" format _ },
    //these merge strategies are for the htmlcompressor
//    mergeStrategy in assembly <<= (mergeStrategy in assembly) { (old) =>
//      {
//        case s: String if s.startsWith("org/mozilla/javascript/") => MergeStrategy.first
//        case s: String if s.startsWith("jargs/gnu/") => MergeStrategy.first
//        case "README" => MergeStrategy.first
//        case "CHANGELOG" => MergeStrategy.first
//        case x => old(x)
//      }
//    }
  )
}
