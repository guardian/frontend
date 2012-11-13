// Additional information on initialization
logLevel := Level.Warn

resolvers ++= Seq(
  "Typesafe repository" at "http://repo.typesafe.com/typesafe/releases/",
  "Templemore Repository" at "http://templemore.co.uk/repo",
  Classpaths.typesafeResolver
)

addSbtPlugin("play" % "sbt-plugin" % "2.1-06142012")

addSbtPlugin("com.typesafe.sbtscalariform" % "sbtscalariform" % "0.4.0")

addSbtPlugin("templemore" %% "xsbt-cucumber-plugin" % "0.5.0")
 
resolvers += Resolver.url("sbt-plugin-releases",
  new URL("http://scalasbt.artifactoryonline.com/scalasbt/sbt-plugin-releases/"))(
    Resolver.ivyStylePatterns)
    
addSbtPlugin("org.scalatra.requirejs" % "sbt-requirejs" % "0.0.3")