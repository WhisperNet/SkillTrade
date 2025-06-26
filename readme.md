# SkillTrade - Peer-to-Peer Skill Exchange Platform

SkillTrade is a comprehensive microservices-based platform that enables users to exchange skills and knowledge through structured learning sessions. The platform facilitates peer-to-peer learning where users can both teach their expertise and learn new skills from others in the community.

## 📋 Table of Contents

- [🏗️ Project Architecture](#️-project-architecture)
  - [Microservices Overview](#microservices-overview)
  - [Infrastructure](#infrastructure)
- [🚀 Core Features](#-core-features)
  - [1. User Authentication & Profiles](#1-user-authentication--profiles)
  - [2. Community & Social Features](#2-community--social-features)
  - [3. Connection & Session Management](#3-connection--session-management)
  - [4. Premium Learning Experience](#4-premium-learning-experience)
  - [5. Payment Processing](#5-payment-processing)
  - [6. Review & Rating System](#6-review--rating-system)
- [🛠️ Technology Stack](#️-technology-stack)
  - [Frontend (skilltrade-client)](#frontend-skilltrade-client)
  - [Backend Services (Node.js/TypeScript)](#backend-services-nodejstypescript)
  - [Shared Library (@cse-350/shared-library)](#shared-library-cse-350shared-library)
  - [Infrastructure & DevOps](#infrastructure--devops)
- [🔄 Service Communication](#-service-communication)
  - [Event-Driven Architecture](#event-driven-architecture)
  - [API Gateway Pattern](#api-gateway-pattern)
- [🗄️ Data Models](#️-data-models)
  - [User Model (Authentication Service)](#user-model-authentication-service)
  - [Post Model (Community Service)](#post-model-community-service)
  - [Session Model (Connection Service)](#session-model-connection-service)
  - [Payment Model (Payments Service)](#payment-model-payments-service)
- [🚦 Getting Started](#-getting-started)
  - [🚀 How to Run Locally](#-how-to-run-locally)
  - [Prerequisites](#prerequisites)
  - [Local Development Setup](#local-development-setup)
  - [Environment Configuration](#environment-configuration)
- [🧪 Testing](#-testing)
- [🔒 Security Features](#-security-features)
- [📈 Scalability Considerations](#-scalability-considerations)

## 🏗️ Project Architecture

### Microservices Overview

SkillTrade follows a microservices architecture with 5 core services communicating through event-driven patterns:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  skilltrade-    │    │  skilltrade-    │    │  skilltrade-    │
│     client      │    │     auth        │    │   community     │
│   (Next.js)     │    │  (Node.js/TS)   │    │  (Node.js/TS)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   NATS Event    │
                    │     Streaming   │
                    └─────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  skilltrade-    │    │  skilltrade-    │    │     shared      │
│  connection     │    │   payments      │    │   library       │
│  (Node.js/TS)   │    │  (Node.js/TS)   │    │  (TypeScript)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Infrastructure

- **Container Orchestration**: Kubernetes with Skaffold for local development
- **Ingress Controller**: NGINX for routing requests to appropriate services
- **Message Streaming**: NATS Streaming Server for event-driven communication
- **Database**: MongoDB (individual instances per service)
- **Development Workflow**: Skaffold with hot-reload capabilities

## 🚀 Core Features

### 1. User Authentication & Profiles
- **User Registration/Login**: Secure authentication with JWT tokens
- **Profile Management**: Comprehensive user profiles with:
  - Personal information (name, email, profile picture)
  - Professional details (occupation: professional/student/freelancer/entrepreneur)
  - Availability schedule (days of the week)
  - Skills to teach and learn
  - Session statistics and premium status

### 2. Community & Social Features
- **Skill Exchange Posts**: Users create posts advertising:
  - Skills they want to teach
  - Skills they want to learn
  - Availability windows
  - Personal introduction and background
- **Social Interactions**:
  - Like posts from other users
  - Send connection requests
  - Browse and search community posts
  - Filter by skills, availability, and premium status

### 3. Connection & Session Management
- **Connection Workflow**:
  - Send connection requests through posts
  - Accept/reject incoming requests
  - Automatic session creation upon acceptance
- **Session Features**:
  - Bidirectional teaching (both users teach and learn)
  - Session scheduling and management
  - Session completion tracking
  - Mutual review system

### 4. Premium Learning Experience
- **Video Conferencing**: Real-time video calls using Agora SDK
- **Interactive Whiteboard**: Collaborative whiteboard for visual learning
- **Real-time Chat**: HTTP-based chat system during sessions

### 5. Payment Processing
- **Stripe Integration**: Secure payment processing for premium features
- **Premium Subscriptions**: Enhanced features for paying users
- **Payment Event Handling**: Automatic premium status updates

### 6. Review & Rating System
- **Mutual Reviews**: Both participants can review each other
- **Rating Analytics**: Visual charts showing user performance
- **Teaching Statistics**: Track sessions taught and overall ratings

## 🛠️ Technology Stack

### Frontend (skilltrade-client)
- **Framework**: Next.js 15.3.3 with React 19
- **Styling**: Tailwind CSS with custom animations
- **UI Components**: 
  - Radix UI primitives for accessibility
  - Custom component library with shadcn/ui
  - Lucide React icons
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for analytics visualization
- **Video/Audio**: Agora RTC SDK for real-time communication
- **Whiteboard**: @netless/fastboard for collaborative drawing
- **Payments**: Stripe SDK for payment processing

### Backend Services (Node.js/TypeScript)
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST APIs
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with cookie sessions
- **Validation**: Express-validator for request validation
- **Testing**: Jest with MongoDB Memory Server
- **Development**: ts-node-dev for hot reloading

### Shared Library (@cse-350/shared-library)
- **Common Types**: TypeScript interfaces and types
- **Event Definitions**: NATS event schemas and handlers
- **Middleware**: Authentication, validation, and error handling
- **Error Classes**: Standardized error responses

### Infrastructure & DevOps
- **Containerization**: Docker for all services
- **Orchestration**: Kubernetes with custom manifests
- **Development**: Skaffold for local development workflow
- **Message Broker**: NATS Streaming Server
- **Ingress**: NGINX Ingress Controller
- **Domain**: skilltrade.dev (local development)

## 🔄 Service Communication

### Event-Driven Architecture

Services communicate asynchronously through NATS Streaming with these key events:

1. **Payment Events**:
   ```typescript
   PaymentCreated → Updates user premium status across services
   ```

2. **Connection Events**:
   ```typescript
   ConnectionRequested → Notifies connection service
   ConnectionAccepted → Creates session and updates user stats
   ConnectionRejected → Cleans up connection requests
   ConnectionCancelled → Handles cancellation logic
   ```

3. **Review Events**:
   ```typescript
   ReviewCreated → Updates user ratings and session completion
   ```

4. **Post Events**:
   ```typescript
   PostDeleted → Cleanup across dependent services
   ```

### API Gateway Pattern

NGINX Ingress routes requests based on path patterns:
- `/api/users/*` → Authentication Service (Port 3000)
- `/api/community/*` → Community Service (Port 3000)
- `/api/payment/*` → Payments Service (Port 3000)
- `/api/connections/*` → Connection Service (Port 3000)
- `/*` → Client Application (Port 3000)

## 🗄️ Data Models

### User Model (Authentication Service)
```typescript
interface User {
  email: string
  password: string (hashed)
  profilePicture: string
  fullName: string
  description: string
  occupation: "professional" | "student" | "freelancer" | "entrepreneur" | "other"
  availability: Array<DayOfWeek>
  gender: "male" | "female" | "other"
  sessionsTaught: number
  isPremium: boolean
}
```

### Post Model (Community Service)
```typescript
interface Post {
  authorId: string
  authorName: string
  authorProfilePicture: string
  isPremium: boolean
  title: string
  content: string
  availability: Array<DayOfWeek>
  likes: string[]
  connections: string[]
  connectionAccepted: string[]
  toTeach: string[]
  toLearn: string[]
}
```

### Session Model (Connection Service)
```typescript
interface Session {
  sessionTakerOneId: string
  sessionTakerTwoId: string
  sessionTakerOneName: string
  sessionTakerTwoName: string
  sessionTakerOneProfilePicture: string
  sessionTakerTwoProfilePicture: string
  isEnded: boolean
  isReviewedByTakerOne: boolean
  isReviewedByTakerTwo: boolean
  toTeach: string[]
  toLearn: string[]
  sessionTakerOneTeaching: number
  sessionTakerTwoTeaching: number
  nextSessionBeginsAt: Date
}
```

### Payment Model (Payments Service)
```typescript
interface Payment {
  userId: string
  stripeId: string
  // Additional payment-related fields
}
```

## 🚦 Getting Started

## 🚀 How to Run Locally

### Prerequisites

Before running SkillTrade locally, ensure you have the following installed:

- **Docker Desktop:Windows & MacOS** (with Kubernetes enabled) **OR**
- **Docker:Linux** (with [minikube](https://minikube.sigs.k8s.io/docs/start/?__hstc=226609730.4b44870ec4a577029c49e44b73bd3bee.1704931200262.1704931200263.1704931200264.1&__hssc=226609730.1.1704931200265&__hsfp=659407567&arch=%2Flinux%2Fx86-64%2Fstable%2Fbinary+download) installed).

- **kubectl** - Kubernetes command-line tool
- **Skaffold** - For development workflow automation
- **Node.js** (v16 or higher)
- **npm** or **yarn**

### Local Development Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/Rezaul-2020331029/SkillTrade.git

cd SkillTrade
```

#### 2. Enable Kubernetes in Docker Desktop

- Open Docker Desktop
- Go to Settings → Kubernetes
- Check "Enable Kubernetes"
- Click "Apply & Restart"

#### 3. Install Skaffold

```bash
# For macOS
brew install skaffold

# For Linux
curl -Lo skaffold https://storage.googleapis.com/skaffold/releases/latest/skaffold-linux-amd64
sudo install skaffold /usr/local/bin/

# For Windows
choco install skaffold
```

#### 4. Setup Ingress Controller (NGINX)

```bash
# For Minikube users
minikube addons enable ingress

# For other users
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
```

#### 5. Configure Local Domain

Add the following to your `/etc/hosts` file (or `C:\Windows\System32\drivers\etc\hosts` on Windows):

```bash
#For Docker Dekstop
127.0.0.1 skilltrade.dev
```

For minikube we first need to find the minikube IP and add it to the config file by:

```bash
minikube ip
```

#### 6. Set Environment Variables

Create the required Kubernetes secrets:

- [Get a test Stripe Key](https://eu.onetimesecret.com/secret/62wyydnlfatavsha6xcec0imjbisc1l)
- If expired contact : ridowan.cse@gmail.com

```bash
# JWT Secret
kubectl create secret generic jwt-secret --from-literal=JWT_KEY=your_jwt_secret_key

# Stripe Secret (for payments)
kubectl create secret generic stripe-secret --from-literal=STRIPE_KEY=your_stripe_secret_key
```

#### 7. Start the Development Environment

```bash
# Run all microservices with hot reload
skaffold dev
```

This will:

- Build all Docker images
- Deploy all microservices to Kubernetes
- Set up port forwarding
- Enable hot reload for development

### 📱 Access the Application

Once everything is running:

- **Frontend**: https://skilltrade.dev
- **API Services**: Available through the ingress controller at https://skilltrade.dev/api/*

### 🛠️ Development Commands

#### Individual Service Development

```bash
# Run specific service locally (outside Kubernetes)
cd skilltrade-auth
npm install
npm run dev

# Run tests
npm test

# Build shared library
cd shared
npm run build
npm publish  # If you have publish permissions
```

#### Kubernetes Management

```bash
# View all pods
kubectl get pods

# View services
kubectl get services

# View logs for a specific service
kubectl logs -f deployment/skilltrade-auth-depl

# Delete all resources
kubectl delete -f infra/k8s/
```

#### Database Access

Each microservice has its own MongoDB instance:

```bash
# Port forward to access databases
kubectl port-forward service/skilltrade-auth-mongodb-srv 27017:27017
kubectl port-forward service/skilltrade-community-mongodb-srv 27018:27017
kubectl port-forward service/skilltrade-connection-mongodb-srv 27019:27017
kubectl port-forward service/skilltrade-payments-mongodb-srv 27020:27017
```

### 🐛 Troubleshooting

#### Common Issues:

1. **Ingress not working**: Ensure NGINX ingress controller is installed and running. Sometimes the NGNIX deployment can take upto 5mins to be ready
2. **Services not starting**: Check if all secrets are created properly
3. **Database connection issues**: Verify MongoDB services are running
4. **Hot reload not working**: Restart skaffold with `skaffold dev --no-prune=false --cache-artifacts=false`
5. **Unable to access the site in the browser** :The browser may prevent accessing the site as the SSL certificate is a mock. To bypass this click on the browser window and type `thisisunsafe`
6. **Unable to deploy the application with skaffold**: Make sure minikube is running by `minikube start --driver=docker` if you're using minikube instaed of docker dekstop

#### Useful Debug Commands:

```bash
# Check ingress
kubectl get ingress

# Describe problematic pods
kubectl describe pod <pod-name>

# Check events
kubectl get events --sort-by=.metadata.creationTimestamp
```


## 🧪 Testing

Each service includes comprehensive test suites:
```bash
# Run all tests across services
npm run test:all

# Run tests for specific service
cd skilltrade-auth
npm test

# Run tests in watch mode
npm test -- --watch
```

Tests include:
- Unit tests for business logic
- Integration tests for API endpoints
- MongoDB Memory Server for database testing
- Supertest for HTTP testing

## 🔒 Security Features

- **Authentication**: JWT-based stateless authentication
- **Authorization**: Route-level protection with middleware
- **Password Security**: bcrypt hashing with salt rounds
- **Input Validation**: Express-validator for request sanitization
- **CORS**: Configured for secure cross-origin requests
- **Environment Isolation**: Containerized services with network policies

## 📈 Scalability Considerations

- **Horizontal Scaling**: Each service can be scaled independently
- **Database Separation**: Each service has its own MongoDB instance
- **Event-driven Design**: Loose coupling enables independent deployments
- **Caching Strategy**: Ready for Redis integration for session management
- **Load Balancing**: NGINX ingress provides load balancing capabilities


## 📞 Support

If you need help or have questions, please open an issue or contact us at ridowan.cse@gmail.com.


