module.exports = {
  translation: {
    common: {
      areYouSure: 'Are you sure?',
    },
    menu: {
      brand: 'Tasks Manager',
      home: 'Home',
      users: 'Users',
      settings: 'Settings',
      taskStatuses: 'Task Statuses',
      tasks: 'Tasks',
      signOut: 'Sign out ({{email}})',
    },
    sessions: {
      new: {
        title: 'Sign In',
        email: 'Email',
        password: 'Password',
        submit: 'Submit',
      },
      delete: {
        title: 'Sign Out',
      },
    },
    users: {
      index: {
        title: 'Users',
        email: 'Email',
        edit: 'Edit',
        delete: 'Delete',
      },
      new: {
        title: 'Sign Up',
        form: {
          submit: 'Submit',
          delete: 'Delete',
        },
      },
      edit: {
        title: 'Edit user {{email}}',
        success: 'User was updated',
        form: {
          submit: 'Submit',
          delete: 'Delete',
        },
      },
    },
    taskStatuses: {
      new: {
        title: 'Create task status',
        form: {
          submit: 'Submit',
        },
      },
      index: {
        title: 'Task statuses',
        create: 'Create new task status',
        edit: 'Edit',
        delete: 'Delete',
      },
      edit: {
        title: 'Edit Task Status: {{name}}',
        form: {
          submit: 'Submit',
        },
      },
    },
    tasks: {
      index: {
        title: 'Tasks',
        create: 'Create new task',
        filters: {
          myTasks: 'My Tasks',
          tags: 'Tags',
          status: 'Status',
          assignedTo: 'Assigned to',
          submit: 'Filter',
          skip: 'Skip',
        },
        edit: 'Edit',
        delete: 'Delete',
      },
      new: {
        title: 'New Task',
        submit: 'Submit',
      },
      edit: {
        title: 'Edit task: {{name}}',
        success: 'Task was updated',
        form: {
          submit: 'Submit',
          delete: 'Delete',
        },
      },
      show: {
        title: 'Task: {{name}}',
      },
    },
    entity: {
      Task: {
        attributes: {
          name: 'Name',
          description: 'Description',
          status: 'Status',
          creator: 'Creator',
          assignedTo: 'Assigned to',
          tags: 'Tags',
        },
      },
      TaskStatus: {
        attributes: {
          name: 'Status name',
          isDefault: 'Is default',
        },
        validates: {
          name: {
            unique: 'Name "{{name}}" already exists',
          },
        },
      },
      User: {
        attributes: {
          firstName: 'First name',
          lastName: 'Last name',
          email: 'Email',
          password: 'Password',
        },
        validates: {
          email: {
            unique: 'Email "{{name}}" already exists',
            isEmail: '"{{email}}" is not a valid email',
          },
        },
      },
    },
    flash: {
      users: {
        create: {
          error: 'User was not sign up',
          success: 'User was sign up',
        },
        update: {
          success: 'User was updated',
        },
      },
      sessions: {
        create: {
          success: 'User signed in',
          error: 'Wrong email and/or password',
        },
        delete: {
          success: 'User signed out',
        },
      },
      taskStatuses: {
        create: {
          success: 'Taks status created',
        },
        update: {
          success: 'Task status was updated',
        },
        delete: {
          success: 'Task status "{{name}}" was deleted',
        },
      },
      tasks: {
        create: {
          success: 'Task created',
        },
        delete: {
          success: 'Task deleted',
        },
        update: {
          success: 'Task was updated',
        },
      },
    },
  },
};
