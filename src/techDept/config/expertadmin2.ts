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
    {
      icon: 'fa fa-database',
      label: 'Pannel Management',
      to: '/dashboards/pannelManagement',
      component: 'pannel-management',
    },
    {
      icon: 'fa fa-database',
      label: 'Lists',
      to: '/dashboards/alldetails',
      component: 'expertadmintable',
    },
    {
      icon: 'fa fa-database',
      label: 'Online',
      to: '/dashboards/online',
      component: 'expertadmintableonline',
    },
    {
      icon: 'fa fa-database',
      label: 'Meals',
      content: [
        {
          icon: 'fa fa-gears',
          label: 'Meeting Snacks for Rooms',
          to: '/dashboards/sancksdetails',
          component: 'meetingSnacks',
        },
        {
          icon: 'fa fa-gears',
          label: 'Meal Details',
          to: '/dashboards/mealdetails',
          component: 'mealDetails',
        },
      ]
    },
    {
      icon: 'fa fa-database',
      label: 'Offline',
      content: [
        {
          icon: 'fa fa-gears',
          label: 'Report',
          to: '/dashboards/offline',
          component: 'expertadmintableoffline',
        },
        {
          icon: 'fa fa-gears',
          label: 'Meetings Details',
          to: '/dashboards/meeting',
          component: 'expertMeetingDetails',
        },
        {
          icon: 'fa fa-gears',
          label: 'TA/DA Details',
          to: '/dashboards/ta-da',
          component: 'ta-daDetails',
        },
        {
          icon: 'fa fa-gears',
          label: 'Meeting Room Details',
          to: '/dashboards/roomdetails',
          component: 'meetingRoom',
        },
        {
          icon: 'fa fa-gears',
          label: 'Accomodations for Expert',
          to: '/dashboards/allotmentdetails',
          component: 'roomAllotment',
        },
      ],
    },
    //   {
    //     icon: 'fa fa-database',
    //     label: 'Specialization',
    //     to: '/dashboards/specialization',
    //     component: 'specialization',
    //   },
    //   {
    //     icon: 'fa fa-database',
    //     label: 'Jobs/Positions',
    //     to: '/dashboards/jobs',
    //     component: 'jobPositions',
    //   },
    //   {
    //     icon: 'fa fa-database',
    //     label: 'Experience',
    //     to: '/dashboards/experience',
    //     component: 'experience',
    //   },
    //   {
    //     icon: 'fa fa-database',
    //     label: 'Research',
    //     to: '/dashboards/research',
    //     component: 'research',
    //   },
    //   {
    //     icon: 'fa fa-database',
    //     label: 'Additiona Details',
    //     to: '/dashboards/additional-details',
    //     component: 'additionalDetails',
    //   },
  ],
}

export default expertadmin
