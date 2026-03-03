pipeline {
  agent any

  triggers {
    githubPush()
  }

  environment {
    BRANCH_NAME = 'develop'
    DOCKER_IMAGE = 'synergy-hub'

    REMOTE_HOST = 'cvprojecthost1.ddns.net'
    REMOTE_USER = 'chicuong'
    REMOTE_DIR = '/opt/usermanagement'

    SSH_CREDENTIALS_ID = 'linux_server_home'
    GIT_CREDENTIALS_ID = 'github-cred'
    DOCKER_CREDENTIALS_ID = 'DOCKER_CRED'
  }

  stages {
    stage('Checkout') {
      steps {
        git branch: env.BRANCH_NAME,
            credentialsId: env.GIT_CREDENTIALS_ID,
            url: 'https://github.com/plgkiet/synergy-hub.git'
      }
    }

    stage('Build & Test Application') {
      when {
        branch env.BRANCH_NAME
      }
      steps {
        sh '''
          npm install
          npm run build
        '''
      }
    }

    stage('Build & Push Docker Image') {
      when {
        branch env.BRANCH_NAME
      }
      steps {
        withCredentials([usernamePassword(credentialsId: env.DOCKER_CREDENTIALS_ID, usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKERHUB_TOKEN')]) {
          sh 'echo "$DOCKERHUB_TOKEN" | docker login -u "$DOCKER_USERNAME" --password-stdin'
          sh 'docker build -t "$DOCKER_USERNAME/${DOCKER_IMAGE}:latest" .'
          sh 'docker push "$DOCKER_USERNAME/${DOCKER_IMAGE}:latest"'
          sh 'docker logout'
        }
      }
    }

    stage('Deploy to Ubuntu Server') {
      when {
        branch env.BRANCH_NAME
      }
      steps {
        withCredentials([usernamePassword(credentialsId: env.DOCKER_CREDENTIALS_ID, usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKERHUB_TOKEN')]) {
          sshagent([env.SSH_CREDENTIALS_ID]) {
            sh """
              ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST} 'set -e
              echo "🚀 Starting deployment..."
              echo "🖥️  Server: ${REMOTE_HOST}"
              echo "👤 User: ${REMOTE_USER}"
              if docker ps -a --format '{{.Names}}' | grep -qx "synergy-hub"; then
                echo "🧹 Stopping existing container..."
                docker stop synergy-hub || true
                docker rm synergy-hub || true
              fi

              echo "📥 Pulling latest image..."
              docker pull ${DOCKER_USERNAME}/${DOCKER_IMAGE}:latest

              echo "🚀 Running new container..."
              docker run -d --name synergy-hub -p 80:80 ${DOCKER_USERNAME}/${DOCKER_IMAGE}:latest
              
            """
          }
        }
      }
    }
  }

  post {
    always {
      echo 'Pipeline finished.'
    }
  }
}