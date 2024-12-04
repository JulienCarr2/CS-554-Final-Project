export const typeDefs = `#graphql
  type Query {
    getUser(_id: ID!): User
    getUserByAuthID(authID: ID!): User
    getTeam(_id: ID!): Team
    getTask(_id: ID!): Task
    getFullProject(rootID: ID!): [Task]
    getAllUsers: [User]
  }

  type User {
    _id: ID!
    authID: ID!
    username: String!
    firstName: String!
    lastName: String!
    teams: [Team]!
    assignedTasks: [Task]!
  }

  type Task {
    _id: ID!
    name: String!
    description: String
    dueDate: String
    priority: Int
    subtasks: [Task]
    parent: Task
    root: Task!
    users: [User]!
    team: Team!
    progress: Float!
    completed: Boolean!
  }

  type Team {
    _id: ID!
    name: String!
    description: String
    admins: [User]!
    nonAdminUsers: [User]!
    projects: [Task]!
  }

  type Mutation {
    createUser(
      authID: ID!,
      username: String!,
      firstName: String!,
      lastName: String!
    ): User
    deleteUser(userID: ID!): User
    modifyUser(
      userID: ID!,
      username: String,
      firstName: String,
      lastName: String
    ): User
    createTask(
      userID: ID!,
      teamID: ID!,
      taskName: String!,
      parentTaskID: ID,
      taskDescription: String,
      taskDueDate: String!,
      taskPriority: Int!
    ): Task
    deleteTask(taskID: ID!, userID: ID!, rootID: ID!): Task
    modifyTask(
      taskID: ID!,
      userID: ID!,
      taskName: String,
      taskDescription: String,
      taskDueDate: String,
      taskPriority: Int
      parentTaskID: ID
      completed: Boolean
    ): Task
    assignTask(
      taskID: ID!,
      userID: ID!,
      assignedUserID: ID!
    ): Task
    createTeam(
      userID: ID!,
      teamName: String!,
      teamDescription: String
    ): Team
    deleteTeam(
      teamID: ID!,
      userID: ID!
    ): Team
    modifyTeam(
      teamID: ID!, userID: ID!,
      teamName: String,
      teamDescription: String
    ): Team
    addUserToTeam(teamID: ID!, userID: ID!, userToAddID: ID!): Team
    removeUserFromTeam(teamID: ID!, userID: ID!, userToRemoveID: ID!): Team
    setUserAsAdmin(teamID: ID!, userID: ID!, userToSetID: ID!): Team
  }
`;
