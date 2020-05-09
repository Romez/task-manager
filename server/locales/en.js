module.exports = {
  translation: {
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
        fullName: 'Full name',
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
        edit: 'Edit',
        delete: 'Delete',
      },
      new: {
        title: 'New Task',
        submit: 'Submit',
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
          fullName: 'Full name',
        },
        validates: {
          email: {
            unique: 'Email "{{name}}" already exists',
            isEmail: '"{{email}}" is not a valid email',
          },
        },
      },
      Guest: {
        attributes: {
          fullName: 'Full name',
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
          error: 'Email and/or password wrong',
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
      },
    },
  },
};
