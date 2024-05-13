const notification = {
  module: 'notification',
  menu: [
    {
      "icon": "fa fa-tachometer",
      "label": "Dashboards",
      "content": [
        {
          "icon": "fa fa-gears",
          "label": "Main",
          "to": "/dashboards/main",
          "component": "dashboard"
        }
      ]
    },
    {
      icon: 'fa fa-envelopes-bulk',
      label: 'Notificatons',
      content: [
        {
          icon: 'fa fa-person-shelter',
          label: 'Email',
          to: '/dashboards/email',
          component: 'notificationEmail',
        },
        {
          icon: 'fa fa-file-lines',
          label: 'SMS',
          to: '/dashboards/sms',
          component: 'notificationSms',
        },
      ],
    },
  ],
}

export default notification
