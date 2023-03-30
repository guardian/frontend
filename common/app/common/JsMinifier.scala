package common

import java.security.MessageDigest

import com.google.javascript.jscomp._
import conf.switches.Switches
import play.twirl.api.Html
import play.twirl.api.JavaScriptFormat.{Appendable => Javascript}
import play.api.Mode.Dev

import scala.collection.concurrent.TrieMap
import scala.util.Try

object JsMinifier {

  def compilerOptions: CompilerOptions = {
    val options = new CompilerOptions()

    /* Checks */
    options.setCheckTypes(true)
    options.setCheckSuspiciousCode(true)
    options.setStrictModeInput(true)
    options.setWarningLevel(DiagnosticGroups.MISSING_OVERRIDE, CheckLevel.WARNING)
    options.setWarningLevel(DiagnosticGroups.MISSING_PROVIDE, CheckLevel.WARNING)
    options.setWarningLevel(DiagnosticGroups.GLOBAL_THIS, CheckLevel.WARNING)

    //Aggressive, you need all JS variable defined somewhere for it not to throw (Such as window or navigator)
    //options.setCheckSymbols(true)

    /* Diagnostic checks */
    options.setWarningLevel(DiagnosticGroups.ACCESS_CONTROLS, CheckLevel.WARNING)
    options.setWarningLevel(DiagnosticGroups.DEPRECATED_ANNOTATIONS, CheckLevel.WARNING)
    options.setWarningLevel(DiagnosticGroups.DEBUGGER_STATEMENT_PRESENT, CheckLevel.WARNING)
    options.setWarningLevel(DiagnosticGroups.CHECK_REGEXP, CheckLevel.WARNING)
    options.setWarningLevel(DiagnosticGroups.INVALID_CASTS, CheckLevel.WARNING)
    options.setWarningLevel(DiagnosticGroups.CHECK_USELESS_CODE, CheckLevel.WARNING)

    //Aggressive
    //options.setWarningLevel(DiagnosticGroups.DUPLICATE_VARS, CheckLevel.WARNING)
    //options.setWarningLevel(DiagnosticGroups.MISSING_PROPERTIES, CheckLevel.WARNING)

    options.setLanguageIn(CompilerOptions.LanguageMode.ECMASCRIPT_2015)
    options.setLanguageOut(CompilerOptions.LanguageMode.ECMASCRIPT3)

    options
  }

  private def compileUnsafe(codeToCompile: String, fileName: String, compilationLevel: CompilationLevel): String = {
    val compiler = new Compiler()

    val options = compilerOptions

    compilationLevel.setOptionsForCompilationLevel(options)

    val extern: SourceFile = SourceFile.fromCode("extern.js", "")
    val input: SourceFile = SourceFile.fromCode(fileName, codeToCompile)

    val result: Result = compiler.compile(extern, input, options)

    if (result.warnings.isEmpty && result.errors.isEmpty && result.success) {
      compiler.toSource
    } else {
      val errors: List[String] = result.errors.toArray().map(_.toString).toList
      val warnings: List[String] = result.warnings.toArray().map(_.toString).toList
      val errorString: String = s"${errors.mkString("\n")}\n${warnings.mkString("\n")}}"
      throw new RuntimeException(errorString)
    }
  }

  def unsafeCompileWithAdvancedOptimisation(codeToCompile: String, fileName: String): String =
    Try(compileUnsafe(codeToCompile, fileName, CompilationLevel.ADVANCED_OPTIMIZATIONS))
      .filter(_.nonEmpty)
      .get

  def unsafeCompileWithStandardOptimisation(codeToCompile: String, fileName: String): String =
    Try(compileUnsafe(codeToCompile, fileName, CompilationLevel.SIMPLE_OPTIMIZATIONS))
      .filter(_.nonEmpty)
      .get

  def unsafeCompileWithWhitespaceOptimisation(codeToCompile: String, fileName: String): String =
    Try(compileUnsafe(codeToCompile, fileName, CompilationLevel.WHITESPACE_ONLY))
      .filter(_.nonEmpty)
      .get

  //Default is to compile with Advanced Optimisations
  val unsafeCompile: (String, String) => String = unsafeCompileWithStandardOptimisation

}

object InlineJs {
  private val memoizedMap: TrieMap[String, String] = TrieMap()

  def withFileNameHint(codeToCompile: String, fileName: String)(implicit context: model.ApplicationContext): Html = {
    if (codeToCompile.trim.nonEmpty) {
      if (context.environment.mode == Dev) {
        Html(optimizeJs(codeToCompile, fileName))
      } else {
        val md5 = new String(MessageDigest.getInstance("MD5").digest(codeToCompile.getBytes))
        Html(memoizedMap.getOrElseUpdate(md5, optimizeJs(codeToCompile, fileName)))
      }
    } else {
      Html(codeToCompile)
    }
  }

  private def optimizeJs(codeToCompile: String, fileName: String): String = {
    if (Switches.InlineJSStandardOptimisation.isSwitchedOn) {
      JsMinifier.unsafeCompileWithStandardOptimisation(codeToCompile, fileName)
    } else {
      JsMinifier.unsafeCompileWithWhitespaceOptimisation(codeToCompile, fileName)
    }
  }

  def apply(codeToCompile: String, fileName: String = "input.js")(implicit context: model.ApplicationContext): Html =
    withFileNameHint(codeToCompile, fileName)
  def apply(codeToCompile: Javascript, fileName: String)(implicit context: model.ApplicationContext): Html =
    this(codeToCompile.body, fileName)
}
