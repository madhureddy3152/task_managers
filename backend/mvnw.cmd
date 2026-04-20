@echo off
setlocal
set MAVEN_PROJECTBASEDIR=%~dp0
set MAVEN_WRAPPER_JAR=%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-wrapper.jar
set MAVEN_WRAPPER_PROPERTIES=%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-wrapper.properties
if not exist "%MAVEN_WRAPPER_JAR%" (
  echo Maven wrapper JAR not found. Please run the wrapper download command or place the jar at %MAVEN_WRAPPER_JAR%
  exit /b 1
)
java -Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR% -cp "%MAVEN_WRAPPER_JAR%" org.apache.maven.wrapper.MavenWrapperMain %*
