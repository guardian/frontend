import collection.Seq
import java.io.File
import java.util.UUID
import sbt._
import Keys._
import PlayProject._

object FrontendArticle extends Build {

  private implicit def file2relative(file: File) = new {
    def relativePathFrom(parent: File): String = file.getAbsolutePath.replace(parent.getAbsolutePath, "")
  }
  
  val appName = "frontend-article"
  val appVersion = "1-SNAPSHOT"

  val appDependencies = Seq(
    //dependencies included in distribution
    "com.gu.openplatform" %% "content-api-client" % "1.13",
    "com.gu" %% "configuration" % "3.6",

    //dependencies in test only
    "org.scalatest" %% "scalatest" % "1.6.1" % "test"
  )

  val main = PlayProject(appName, appVersion, appDependencies, mainLang = SCALA).settings(
    // Disable Specs options to use ScalaTest
    testOptions in Test := Nil,
    dist ~= addMagentaConfig
  )

  def addMagentaConfig = { originalZipFile: File =>
    import IO._

    println("Adding deploy.json to artifact")
    val tmpDir = createTemporaryDirectory
    unzip(originalZipFile, tmpDir)
    copyFile(file("conf") / "deploy.json", tmpDir / "deploy.json")

    val originalZipFileDirectory = originalZipFile.getParentFile
    delete(originalZipFile)

    val buildNumber = Option(System.getenv("BUILD_NUMBER")).getOrElse("LOCAL")
    val filesToZip = (tmpDir ** "*").get map {file =>
      (file -> file.relativePathFrom(tmpDir).replaceFirst(appVersion, buildNumber))
    }

    println("Renaming " + originalZipFile.getName +" -> " + "artifacts.zip")
    val modifiedZipFile = new File(originalZipFileDirectory, "artifacts.zip")
    zip(filesToZip, modifiedZipFile)
    delete(tmpDir)

    modifiedZipFile
  }
}

