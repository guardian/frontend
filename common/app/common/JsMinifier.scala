package common

import java.security.MessageDigest

import com.google.javascript.jscomp._
import conf.Switches
import play.api.{Application, Play}
import play.twirl.api.Html

import scala.collection.concurrent.TrieMap
import scala.util.Try

object JsMinifier {

  val compilerOptions = {
    val options = new CompilerOptions()

    /* Checks */
    options.setCheckTypes(true)
    options.setCheckSuspiciousCode(true)
    options.setReportMissingOverride(CheckLevel.WARNING)
    options.setCheckProvides(CheckLevel.WARNING)
    options.setCheckGlobalNamesLevel(CheckLevel.WARNING)
    options.setBrokenClosureRequiresLevel(CheckLevel.WARNING)
    options.setCheckGlobalThisLevel(CheckLevel.WARNING)

    //Aggressive, you need all JS variable defined somewhere for it not to throw (Such as window or navigator)
    //options.setCheckSymbols(true)

    /* Diagnostic checks */
    options.setWarningLevel(DiagnosticGroups.ACCESS_CONTROLS, CheckLevel.WARNING)
    options.setWarningLevel(DiagnosticGroups.LINT_CHECKS, CheckLevel.WARNING)
    options.setWarningLevel(DiagnosticGroups.DEPRECATED_ANNOTATIONS, CheckLevel.WARNING)
    options.setWarningLevel(DiagnosticGroups.DEBUGGER_STATEMENT_PRESENT, CheckLevel.WARNING)
    options.setWarningLevel(DiagnosticGroups.CHECK_REGEXP, CheckLevel.WARNING)
    options.setWarningLevel(DiagnosticGroups.UNNECESSARY_CASTS, CheckLevel.WARNING)
    options.setWarningLevel(DiagnosticGroups.INVALID_CASTS, CheckLevel.WARNING)
    options.setWarningLevel(DiagnosticGroups.CHECK_USELESS_CODE, CheckLevel.WARNING)

    //Aggressive
    //options.setWarningLevel(DiagnosticGroups.DUPLICATE_VARS, CheckLevel.WARNING)
    //options.setWarningLevel(DiagnosticGroups.MISSING_PROPERTIES, CheckLevel.WARNING)

    options.setLanguageIn(CompilerOptions.LanguageMode.ECMASCRIPT6_STRICT)
    options.setLanguageOut(CompilerOptions.LanguageMode.ECMASCRIPT3)

    options
  }

  private def compileUnsafe(codeToCompile: String, compilationLevel: CompilationLevel): String = {
    val compiler = new Compiler()

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

  def unsafeCompileWithAdvancedOptimisation(codeToCompile: String): String =
    Try(compileUnsafe(codeToCompile, CompilationLevel.ADVANCED_OPTIMIZATIONS))
      .filter(_.nonEmpty)
      .get

  def unsafeCompileWithStandardOptimisation(codeToCompile: String): String =
    Try(compileUnsafe(codeToCompile, CompilationLevel.SIMPLE_OPTIMIZATIONS))
      .filter(_.nonEmpty)
      .get

  def unsafeCompileWithWhitespaceOptimisation(codeToCompile: String): String =
    Try(compileUnsafe(codeToCompile, CompilationLevel.WHITESPACE_ONLY))
      .filter(_.nonEmpty)
      .get

  //Default is to compile with Advanced Optimisations
  val unsafeCompile: String => String = unsafeCompileWithStandardOptimisation

}

object InlineJs {
  private val memoizedMap: TrieMap[String, String] = TrieMap()

  def apply(codeToCompile: String)(implicit application: Application): Html = {
    if (Switches.InlineJsSwitch.isSwitchedOn) {
      val md5 = new String(MessageDigest.getInstance("MD5").digest(codeToCompile.getBytes))
      lazy val compiledCode: String =
        JsMinifier.unsafeCompileWithStandardOptimisation(codeToCompile)

      Html(memoizedMap.getOrElseUpdate(md5, compiledCode))
    } else {
      Html(codeToCompile)
    }
  }
}
