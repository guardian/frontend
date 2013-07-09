package common

import scala.util.parsing.combinator.RegexParsers
import scala.language.postfixOps

object CSV extends implicits.Strings {

  def write(fields: String*): String = {
    // Escape quotes in fields
    val escaped = fields map { field => nullsafeString(field).replaceAll("\"", "\"\"") }
    escaped.mkString("\"", "\",\"", "\"")
  }

  def write(fields: Product): String = {
    val reshaped = fields.productIterator.toSeq map { nullsafeString }
    write(reshaped:_*)
  }

  def parse(fields: String): List[String] = Parser(fields)

  // See http://stackoverflow.com/questions/5063022/use-scala-parser-combinator-to-parse-csv-files
  object Parser extends RegexParsers {
    override val skipWhitespace = false

    def COMMA = ","
    def DQUOTE = "\""
    def DQUOTE2 = "\"\"" ^^ { case _ => "\"" } // combine 2 dquotes into 1
    def CRLF = "\r\n" | "\n"
    def TXT = "[^\",\r\n]".r
    def SPACES = "[ \t]+".r

    def record: Parser[List[String]] = repsep(field, COMMA)
    def field: Parser[String] = escaped | nonescaped

    def escaped: Parser[String] = {
      ((SPACES?) ~> DQUOTE ~> ((TXT | COMMA | CRLF | DQUOTE2)*) <~ DQUOTE <~ (SPACES?)) ^^ {
        case ls => ls.mkString("")
      }
    }

    def nonescaped: Parser[String] = (TXT*) ^^ { case ls => ls.mkString("") }

    def apply(s: String) = parseAll(record, s) match {
      case Success(res, _) => res
      case e => throw new Exception(e.toString)
    }
  }
}