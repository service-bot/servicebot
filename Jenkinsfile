def getRepo(){
            String name = "${env.JOB_NAME}";
            String[] value = name.split('/');
            return value[0];
}

def gitCredentials = "JenkinsGithub"


pipeline {
    parameters {
          booleanParam(defaultValue: true, description: 'Execute pipeline?', name: 'shouldBuild')
       }

  agent any
  stages {
        stage("Check if should build"){
        steps{
        script {
            result = sh (script: "git log -1 | grep '.*Jenkins version bump.*'", returnStatus: true)
            if (result == 0) {
                echo ("'Version bump' spotted in git commit. Aborting.")
                env.shouldBuild = "false"
                throw "Bad"
            }
        }
       }
        }

        stage('Build, bump version') {
            when {
                branch 'tiers'
                expression {
                    return env.shouldBuild != "false"
                }

            }
          steps {

              withCredentials([string(credentialsId: 'npm-token', variable: 'NPM_TOKEN')]) {
                              sshagent(credentials: ["${gitCredentials}"]){

                                sh '''
                                      npm version patch -m "Jenkins version bump"
                                      git push origin tiers
                                      git push origin --tags
                                '''


                                }

              }

          }
        }
  }
}
