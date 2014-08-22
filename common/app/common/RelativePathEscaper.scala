package common

object RelativePathEscaper {
  def apply(unescaped: String) = {
    // We are getting Googlebot 404s because Google is incorrectly assessing paths in curl js & json config data
    // so we need to escape them out.
    // "../foo"
    // "./foo"
    // "/foo"
    // and any that are inside single quotes too

    val leadingDotPathRegex = """["'](\.{1,2}\/){1,}\w*(\/){0,}\w*(\/)?['"]""".r
    val leadingSlashFootballPathRegex = """["'](\/football)(\/team|\/tournament)(\/\w+)['"]""".r

    val dotMatches = leadingDotPathRegex.findAllIn(unescaped)

    val unescaped1 = dotMatches.foldLeft(unescaped) {
      case (result: String, matched: String) =>
        result.replace(matched, matched.replace("./", ".\" + \"/\" + \""))
    }

    val footballMatches = leadingSlashFootballPathRegex.findAllIn(unescaped1)

    val unescaped2 = footballMatches.foldLeft(unescaped1) {
      case (result: String, matched: String) =>
        result.replace(matched, matched.replace("/", "/\" + \""))
    }

    unescaped2
  }

}
