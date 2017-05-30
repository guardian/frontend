package common

object RelativePathEscaper {
  def apply(unescaped: String): String = {
    // We are getting Googlebot 404s because Google is incorrectly assessing paths in curl js & json config data
    // so we need to escape them out.
    // "../foo"
    // "./foo"
    // "/foo"
    // and any that are inside single quotes too

    escapeLeadingSlashFootballPaths(escapeLeadingDotPaths(unescaped))
  }

  def escapeLeadingDotPaths(unescaped: String): String = {
    val leadingDotPathRegex = """["'](\.{1,2}\/){1,}\w*(\/){0,}\w*(\/)?['"]""".r
    val dotMatches = leadingDotPathRegex.findAllIn(unescaped)
    dotMatches.foldLeft(unescaped) {
      case (result: String, matched: String) =>
        result.replace(matched, matched.replace("./", ".\" + \"/\" + \""))
    }
  }

  def escapeLeadingSlashFootballPaths(unescaped: String): String = {
    val leadingSlashFootballPathRegex = """["']?(\/football)(\/team|\/tournament)(\/\w+)['"]?""".r
    val footballMatches = leadingSlashFootballPathRegex.findAllIn(unescaped)
    footballMatches.foldLeft(unescaped) {
      case (result: String, matched: String) =>
        result.replace(matched, matched.replace("/", "/\" + \""))
    }
  }

}
