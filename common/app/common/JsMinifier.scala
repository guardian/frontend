package common

import com.google.javascript.jscomp._
import play.api.Play

import scala.util.Try


object JsMinifier {

  private def compileUnsafe(codeToCompile: String, compilationLevel: CompilationLevel): String = {
    val compiler = new Compiler()

    val compilerOptions: CompilerOptions = new CompilerOptions()
    compilationLevel.setOptionsForCompilationLevel(compilerOptions)

    val extern: SourceFile = SourceFile.fromCode("extern.js", "")
    val input: SourceFile = SourceFile.fromCode("input.js", codeToCompile)

    compiler.compile(extern, input, compilerOptions)

    compiler.toSource
  }

  def maybeCompileWithAdvancedOptimisation(codeToCompile: String): Option[String] =
    if (Play.isDev) {
      Option(codeToCompile)}
    else {
      Try(compileUnsafe(codeToCompile, CompilationLevel.ADVANCED_OPTIMIZATIONS))
        .toOption
        .filter(_.nonEmpty)}

  def maybeCompileWithStandardOptimisation(codeToCompile: String): Option[String] =
    if (Play.isDev) {
      Option(codeToCompile)}
    else {
      Try(compileUnsafe(codeToCompile, CompilationLevel.SIMPLE_OPTIMIZATIONS))
        .toOption
        .filter(_.nonEmpty)}

  def maybeCompileWithWhitespaceOptimisation(codeToCompile: String): Option[String] =
    if (Play.isDev) {
      Option(codeToCompile)}
    else {
      Try(compileUnsafe(codeToCompile, CompilationLevel.WHITESPACE_ONLY))
        .toOption
        .filter(_.nonEmpty)}

  //Default is to compile with Advanced Optimisations
  val maybeCompile: String => Option[String] = maybeCompileWithAdvancedOptimisation

}

