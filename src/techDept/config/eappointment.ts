const eappointment = {
    "module": "eappointment",
    "menu": [
      {
        "icon": "fa fa-home",
        "label": "Dashboard",
        "to": "/dashboards/"
      },
      {
        "icon": "fa fa-sign-in",
        "label": "E-Appointment",
        "content": [
          {
            "icon": "fa fa-person-shelter",
            "label": "Appointment Calendar",
            "to": "/dashboards/calendar",
            "component": "calendar"
          },
          {
            "icon": "fa fa-person-shelter",
            "label": "Appointment Reports",
            "to": "/dashboards/reports",
            "component": "reports"
          },
          {
            "icon": "fa fa-person-shelter",
            "label": "Unavailable",
            "to": "/dashboards/unavailable",
            "component": "unavailable"
          }
        ]
      }
    ]
  }

  export default eappointment;