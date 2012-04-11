import collection.Seq
import com.google.common.io.Files
import com.typesafe.sbtscalariform.ScalariformPlugin
import java.io.File
import java.security.MessageDigest
import sbt._
import Keys._
import PlayProject._
import sbtassembly.Plugin._
import AssemblyKeys._

object FrontendArticle extends Build {

  private val appName = "frontend-article"
  private val appVersion = "1-SNAPSHOT"

  private val staticPathsFile = SettingKey[File]("static-paths-file",
    "The location of the file that static paths are generated in")

  private val appDependencies = Seq(
    //dependencies included in distribution
    "com.gu.openplatform" %% "content-api-client" % "1.13",
    "com.gu" %% "configuration" % "3.6",
    "com.gu" %% "management-play" % "5.7",
    "com.gu" %% "management-logback" % "5.7",

    //dependencies in test only
    "org.scalatest" %% "scalatest" % "1.7.1" % "test"
  )

  val main = PlayProject(appName, appVersion, appDependencies, mainLang = SCALA)
    .settings(ScalariformPlugin.settings ++ assemblySettings: _*)
    .settings(
    resolvers += "Guardian Github Releases" at "http://guardian.github.com/maven/repo-releases",
    // Disable Specs options to use ScalaTest
    testOptions in Test := Nil,
    organization := "com.gu",
    scalaVersion := "2.9.1",
    maxErrors := 20,
    javacOptions ++= Seq("-source", "1.6", "-target", "1.6", "-encoding", "utf8"),
    scalacOptions ++= Seq("-unchecked", "-optimise", "-deprecation", "-Xcheckinit", "-encoding", "utf8"),

    mainClass in assembly := Some("play.core.server.NettyServer"),
    jarName in assembly := "%s.jar" format appName,
    test in assembly := {},
    excludedFiles in assembly := {
      (base: Seq[File]) =>
        //todo
        ((base / "logger.xml") +++ (base / "META-INF" / "MANIFEST.MF")).get
    },
    //resourceGenerators in Compile <+= staticFileUrlGenerator,
    sourceGenerators in Compile <+= staticFileRoutes,
    staticPathsFile in Compile <<= (resourceManaged in Compile) / "static-paths.properties",
    dist <<= myDistTask
  )



  //TODO PLUGIN ME


  val LessFile = """(.*)\.less$""".r
  val CoffeeFile = """(.*)\.coffee$""".r
  val JavaScriptFile = """(.*)\.js$""".r


  def hashFiles(base: File): Seq[(String,String)] = {

    val assetsDir = (base / "app" / "assets")

    val resourceFiles = (assetsDir ** "*").get.filter(!_.isDirectory)

    val hashedResourceFiles = resourceFiles.flatMap(f => f.relativeTo(assetsDir).map((digestFor(f), _)))

    val generatedPaths = hashedResourceFiles flatMap {
      case (hash, file) =>
        file.getPath match {
          case LessFile(name) => List((name + ".css", name + "." + hash + ".css"),
            (name + ".min.css", name + "." + hash + ".min.css"))
          case CoffeeFile(name) => List((name + ".js", name + "." + hash + ".js"),
            (name + ".min.js", name + "." + hash + ".min.js"))
          case JavaScriptFile(name) => List((name + ".js", name + "." + hash + ".js"),
            (name + ".min.js", name + "." + hash + ".min.js"))
          case _ => sys.error("Do not understand resource file: " + name)
        }
    }

    val publicDir = (base / "public")

    val publicPaths = (publicDir ** ("**")).get.filter(!_.isDirectory).flatMap {
      file: File =>
        val hash = digestFor(file)

        file.relativeTo(publicDir).map(_.getPath).toList.map {
          path =>
            val pathParts = path.split("""\.""")
            (path, (pathParts.dropRight(1) ++ List(hash) ++ pathParts.takeRight(1)).mkString("."))
        }
    }
    (generatedPaths ++ publicPaths)
  }

  private def staticFileRoutes = (baseDirectory , streams, sourceManaged).map { (base, s, sourceDir) => {

        val staticMap = hashFiles(base).map {
          case (raw, cached) => """ "%s" -> "%s" """ format (raw, cached)
        } mkString (",")
    
        val template = """
          package controllers

          object Static {

            lazy val staticMappings = Map[String,  String](
              %s
            )
            lazy val reverseMappings = staticMappings.map{ case (key, value) => (value, key) }

            def at(path: String, file: String) = Assets.at(path, reverseMappings(file))

            def at(path: String) = "/assets/" + staticMappings(path)

          }
        """ format (staticMap)


        val file = sourceDir / "controllers" / "Static.scala"
        
        IO.write(file, template)
        
        Seq(file)
    }
  }


  private def digestFor(file: File): String = Hash.toHex(Files.getDigest(file, MessageDigest.getInstance("MD5")))


  def myDistTask =
    (assembly, streams, baseDirectory, target, resourceManaged in Compile) map {
      (jar, s, baseDir, outDir, resourcesDir) => {
        val log = s.log

        val distFile = outDir / "artifacts.zip"
        log.info("Disting %s ..." format distFile)

        if (distFile exists) { distFile delete() }


        val cacheBustedResources = hashFiles(baseDir)

        val resourceAssetsDir = resourcesDir / "public"
        val resourceAssets = cacheBustedResources map { case (key, cachedKey) =>
          (resourceAssetsDir / key, cachedKey)
        } filter { fileExists }

        val publicAssetsDir = baseDir / "public"
        val publicAssets = cacheBustedResources map { case (key, cachedKey) =>
          (publicAssetsDir / key, cachedKey)
        } filter { fileExists }


        val staticFiles = (resourceAssets ++ publicAssets) map { case (file, cachedKey) =>
          val locationInZip = "packages/%s/static-files/%s".format(appName, cachedKey)
          log.verbose("Static file %s -> %s" format (file, locationInZip))
          (file, locationInZip)
        }

        val filesToZip = Seq(
          baseDir / "conf" / "deploy.json" -> "deploy.json",
          jar -> "packages/%s/%s".format(appName, jar.getName)
        ) ++ staticFiles


        IO.zip(filesToZip, distFile)

        //tells TeamCity to publish the artifact => leav this println in here
        println("##teamcity[publishArtifacts '%s => .']" format distFile)

        log.info("Done disting.")
        jar
      }
    }

  private def fileExists(f: (File, String)) = f._1.exists()
}
