package controllers.Helpers

import java.io.File

import recorder.DefaultHttpRecorder

object DeploysTestHttpRecorder extends DefaultHttpRecorder {
  override lazy val baseDir = new File(System.getProperty("user.dir"), "data/deploys")
}
