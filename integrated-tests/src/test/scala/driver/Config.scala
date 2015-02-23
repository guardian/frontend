package integration

import java.io.{FileInputStream, File}
import java.util.Properties

object Config {

  private val userConfig = new File(s"${System.getProperty("user.home")}/.gu/frontend.properties")
  private val machineConfig = new File(s"/etc/gu/frontend.properties")

  // NOTE - order is important
  private val configFiles: Seq[File] = Seq(
    someFileOrNone(userConfig),
    someFileOrNone(machineConfig)
  ).flatten

  private def someFileOrNone(file: File) = if (file.exists) Some(file) else None

  private val properties = {
    val props = new Properties()
    configFiles.foreach(file => props.load(new FileInputStream(file)))
    props
  }

  val remoteMode = optionalProperty("tests.mode").exists(_ == "remote")
  val baseUrl = optionalProperty("tests.baseUrl").getOrElse("http://www.theguardian.com")
  val profileBaseUrl = optionalProperty("tests.profileBaseUrl").getOrElse("https://profile.theguardian.com")

  object stack {
    lazy val userName = mandatoryProperty("stack.userName")
    lazy val automateKey = mandatoryProperty("stack.automateKey")
  }

  private def mandatoryProperty(key: String) = Option(properties.getProperty(key)).getOrElse(
    throw new RuntimeException(s"property not found $key")
  )

  private def optionalProperty(key: String) =
    Option(System.getProperty(s"ng.$key")) // allow overriding with a system property
    .orElse(Option(properties.getProperty(key)))

}
