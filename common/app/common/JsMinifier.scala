package common

import java.security.MessageDigest

import com.google.javascript.jscomp._
import play.api.{Application, Play}
import play.twirl.api.Html

import scala.collection.concurrent.TrieMap
import scala.util.Try


object JsMinifier {

  private def compileUnsafe(codeToCompile: String, compilationLevel: CompilationLevel): String = {
    val compiler = new Compiler()

    val compilerOptions: CompilerOptions = new CompilerOptions()
    compilationLevel.setOptionsForCompilationLevel(compilerOptions)

    val extern: SourceFile = SourceFile.fromCode("extern.js", "")
    val input: SourceFile = SourceFile.fromCode("input.js", codeToCompile)

    val result: Result = compiler.compile(extern, input, compilerOptions)

    if (result.warnings.isEmpty && result.errors.isEmpty && result.success) {
      compiler.toSource
    } else {
      val errors: List[String] = result.errors.map(_.toString).toList
      val warnings: List[String] = result.warnings.map(_.toString).toList
      val errorString: String = s"${errors.mkString("\n")}\n${warnings.mkString("\n")}}"
      throw new RuntimeException(errorString)
    }
  }

  def maybeCompileWithAdvancedOptimisation(codeToCompile: String): Option[String] =
    Try(compileUnsafe(codeToCompile, CompilationLevel.ADVANCED_OPTIMIZATIONS))
      .toOption
      .filter(_.nonEmpty)

  def maybeCompileWithStandardOptimisation(codeToCompile: String): Option[String] =
    Try(compileUnsafe(codeToCompile, CompilationLevel.SIMPLE_OPTIMIZATIONS))
      .toOption
      .filter(_.nonEmpty)

  def maybeCompileWithWhitespaceOptimisation(codeToCompile: String): Option[String] =
    Try(compileUnsafe(codeToCompile, CompilationLevel.WHITESPACE_ONLY))
      .toOption
      .filter(_.nonEmpty)

  //Default is to compile with Advanced Optimisations
  val maybeCompile: String => Option[String] = maybeCompileWithAdvancedOptimisation

}

object JsMinifierDevSensitive {
  def maybeCompileWithAdvancedOptimisation(codeToCompile: String)(implicit application: Application): Option[String] =
    if (Play.isDev) Option(codeToCompile)
    else JsMinifier.maybeCompileWithAdvancedOptimisation(codeToCompile)

  def maybeCompileWithStandardOptimisation(codeToCompile: String)(implicit application: Application): Option[String] =
    if (Play.isDev) Option(codeToCompile)
    else JsMinifier.maybeCompileWithStandardOptimisation(codeToCompile)

  def maybeCompileWithWhitespaceOptimisation(codeToCompile: String)(implicit application: Application): Option[String] =
    if (Play.isDev) Option(codeToCompile)
    else JsMinifier.maybeCompileWithWhitespaceOptimisation(codeToCompile)

  def maybeCompile(codeToCompile: String)(implicit application: Application): Option[String] =
    maybeCompileWithAdvancedOptimisation(codeToCompile)(application)
}

object InlineJs {
  private val memoizedMap: TrieMap[String, String] = TrieMap()

  def apply(codeToCompile: String)(implicit application: Application): Html = {
    val md5 = new String(MessageDigest.getInstance("MD5").digest(codeToCompile.getBytes))
    lazy val compiledCode: String =
      JsMinifier.maybeCompileWithAdvancedOptimisation(codeToCompile).getOrElse(codeToCompile)

    Html(memoizedMap.getOrElseUpdate(md5, compiledCode))
  }
}
