// Additional information on initialization
logLevel := Level.Warn

resolvers ++= Seq(
//    DefaultMavenRepository,
    "Typesafe Repository" at "http://repo.typesafe.com/typesafe/releases/",
    "sbt-idea-repo" at "http://mpeltonen.github.com/maven/"
)

addSbtPlugin("play" % "sbt-plugin" % "2.0")

addSbtPlugin("com.typesafe.sbteclipse" % "sbteclipse-plugin" % "2.0.0-M3")

addSbtPlugin("com.github.mpeltonen" % "sbt-idea" % "1.0.0")

addSbtPlugin("com.typesafe.sbtscalariform" % "sbtscalariform" % "0.3.1")
