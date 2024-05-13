const courtjudgement = {
  "module": "courtjudgement",
  "menu": [
    {
      "icon": "fa fa-home",
      "label": "Dashboard",
      "to": "/dashboards/"
    },
    {
      "icon": "fa fa-sign-in",
      "label": "Court Judgement",
      "content": [
        {
          "label": "judgement",
          "to": "/dashboards/courtjudgement",
          "component": "createjudgement"
        },
        {
          "label": "Branch ",
          "to": "/dashboards/judgementbranch",
          "component": "judgementbranch"
        },
        {
          "label": "Add New Category",
          "to": "/dashboards/judgementcategory",
          "component": "judgementcategory"
        },
        {
          "label": "Manage PSC",
          "to": "/dashboards/managepsc",
          "component": "judgementmanagepsc"
        },
        {
          "label": "User",
          "to": "/dashboards/profile",
          "component": "judgementuser"
        },
        {
          "label": "User Role",
          "to": "/dashboards/userrole",
          "component": "judgementuserrole"
        },
        {
          "label": "Change Password",
          "to": "/dashboards/changepassword",
          "component": "changepassword"
        }
      ]
    }
  ]
}

export default courtjudgement;