const expertadmin = {
  module: 'expert',
  menu: [
    {
      icon: 'fa fa-database',
      label: 'Dashboards',
      content: [
        {
          icon: 'fa fa-gears',
          label: 'Main',
          to: '/dashboards/main',
          component: 'dashboard',
        },
      ],
    },
    // {
    //   icon: 'fa fa-database',
    //   label: 'Detailed Registration',
    //   to: '/dashboards/registration',
    //   component: 'biodataReg',
    // },
    {
      icon: 'fa fa-database',
      label: 'Biodata',
      to: '/dashboards/details',
      component: 'adminDetails',
    },
  ],
}

export default expertadmin
