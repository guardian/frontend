import collection.Seq
import java.io.File
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
      testOptions in Test := Nil
  )

  def packageArtifact = { jar: File =>
    
    println("Uber jar file is: " + jar.getAbsolutePath)

    val artifactsFile = file("artifacts.zip")

    println(artifactsFile.getAbsolutePath)

    if (artifactsFile.exists()) {
      println("Deleting old artifacts.zip")
      artifactsFile.delete()
    }

    val tmpDir = IO.createTemporaryDirectory

    IO.copyFile(file("conf") / "deploy.json", tmpDir / "deploy.json")
    IO.copyFile(jar, tmpDir / jar.getName)

    val filesToZip = (tmpDir ** "*").get map { file => (file -> file.relativePathFrom(tmpDir)) }

    println("Packing tmp artifacts file")
    val tmpArtifactsFile = new File(tmpDir, "artifacts.zip")
    IO.zip(filesToZip, tmpArtifactsFile)
    
    println("Copying tmp artifacts file to artifacts.zip")
    IO.copyFile(tmpArtifactsFile, artifactsFile)

    println("Artifact packaged")

    jar
  }
}
