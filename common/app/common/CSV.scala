package common

import scala.util.parsing.combinator.RegexParsers
import scala.language.postfixOps
import scala.util.matching.Regex

object CSV extends implicits.Strings {

  def write(fields: String*): String = {
    // Escape quotes in fields
    val escaped = fields map { field => nullsafeString(field).replaceAll("\"", "\"\"") }
    escaped.mkString("\"", "\",\"", "\"")
  }

  def write(fields: Product): String = {
    val reshaped = fields.productIterator.toSeq map { nullsafeString }
    write(reshaped: _*)
  }

  def parse(fields: String): List[String] = Parser(fields)

  // See http://stackoverflow.com/questions/5063022/use-scala-parser-combinator-to-parse-csv-files
  object Parser extends RegexParsers {
    override val skipWhitespace = false

    def COMMA: String = ","
    def DQUOTE: String = "\""
    def DQUOTE2: Parser[String] = "\"\"" ^^ (_ => "\"") // combine 2 dquotes into 1
    def CRLF: Parser[String] = "\r\n" | "\n"
    def TXT: Regex = "[^\",\r\n]".r
    def SPACES: Regex = "[ \t]+".r

    def record: Parser[List[String]] = repsep(field, COMMA)
    def field: Parser[String] = escaped | nonescaped

    def escaped: Parser[String] = {
      ((SPACES ?) ~> DQUOTE ~> ((TXT | COMMA | CRLF | DQUOTE2) *) <~ DQUOTE <~ (SPACES ?)) ^^ (ls => ls.mkString(""))
    }

    def nonescaped: Parser[String] = (TXT *) ^^ (ls => ls.mkString(""))

    def apply(s: String): List[String] =
      parseAll(record, s) match {
        case Success(res, _) => res
        case e               => throw new Exception(e.toString)
      }
  }
}
