const marksheet = {
  module: 'marksheet',
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
    {
      icon: 'fa fa-sign-in',
      label: 'View',
      content: [
        {
          label: 'Online Viewing of Marksheet',
          to: '/dashboards/viewing_marksheet',
          component: 'marksheetView',
        },
        {
          label: 'Marks Obtained',
          to: '/dashboards/marks_obtained',
          component: 'marksObtained',
        },
        {
          label: 'Marks Obtained Additional',
          to: '/dashboards/marks_obtained_additional',
          component: 'marksObtainedAdditional',
        },
        //   {
        //     label: 'Monthly Pass',
        //     to: '/dashboards/monthlypass',
        //     component: 'monthlypass',
        //   },
      ],
    },
    //  {
    //    icon: 'fa fa-user',
    //    label: 'Admin',
    //    content: [
    //      {
    //        label: 'Officers',
    //        to: '/dashboards/officers',
    //        component: 'officer',
    //      },
    //      {
    //        label: 'Authorities',
    //        to: '/dashboards/authorities',
    //        component: 'authorities',
    //      },
    //      {
    //        label: 'Visiters',
    //        to: '/dashboards/visiters',
    //        component: 'visiters',
    //      },
    //    ],
    //  },
  ],
}

export default marksheet
