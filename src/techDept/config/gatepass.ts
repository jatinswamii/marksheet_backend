const gatepass ={
  "module": "gatepass",
  "menu": [
    {
      "icon": "fa fa-database",
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
      "icon": "fa fa-sign-in",
      "label": "Gate Pass",
      "content": [
        {
          "label": "Daily Pass",
          "to": "/dashboards/dailypass",
          "component": "dailypass"
        },
        {
          "label": "Monthly Pass",
          "to": "/dashboards/monthlypass",
          "component": "monthlypass"
        }
      ]
    },
    {
      "icon": "fa fa-user",
      "label": "Admin",
      "content": [
        {
          "label": "Officers",
          "to": "/dashboards/officers",
          "component": "officer"
        },
        {
          "label": "Authorities",
          "to": "/dashboards/authorities",
          "component": "authorities"
        },
        {
          "label": "Visiters",
          "to": "/dashboards/visiters",
          "component": "visiters"
        }
      ]
    }
  ]
}

export default gatepass;