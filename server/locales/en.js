module.exports = {
  translation: {
    menu: {
      brand: 'Tasks Manager',
      home: 'Home',
      users: 'Users',
      settings: 'Settings',
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
      },
      new: {
        title: 'Sign Up',
      },
      edit: {
        title: 'User edit {{email}}',
      },
      form: {
        firstName: 'First name',
        lastName: 'Last name',
        email: 'Email',
        password: 'Password',
        submit: 'Submit',
        delete: 'Delete',
      },
    },
    flash: {
      users: {
        create: {
          error: 'User was not sign up',
          success: 'User was sign up',
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
    },
  },
};
