import scala.collection.JavaConverters._

addCommandAlias("idrun", ";run 9009")

testOptions in Test += Tests.Argument("-oF")
