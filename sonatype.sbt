sonatypeProfileName := "com.gu"

publishMavenStyle := true

licenses := Seq("APL2" -> url("http://www.apache.org/licenses/LICENSE-2.0.txt"))

homepage := Some(url("https://(your project url)"))

scmInfo := Some(
  ScmInfo(
    url("https://github.com/guardian/atom-renderer"),
    "scm:git@github.com:guardian/atom-renderer.git"
  )
)

developers := List(
  Developer(id="regiskuckaertz", name="Regis Kuckaertz", email="regis.kuckaertz@theguardian.com", url=url("https://github.com/regiskuckaertz"))
)