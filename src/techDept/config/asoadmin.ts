const asoadmin = {
  "module": "asoadmin",
  "menu": [
    {
      "icon": "fa fa-home",
      "label": "Dashboard",
      "to": "/dashboards/"
    },
    {
      "icon": "fa fa-sign-in",
      "label": "E-Medical",
      "content": [
        {
          "icon": "fa fa-person-shelter",
          "label": "Dak Entry",
          "to": "/dashboards/dakentry",
          "component": "dakentry"
        },
        {
          "icon": "fa fa-file-lines",
          "label": "Assistant Diary Entry",
          "to": "/dashboards/assistantdiaryentry",
          "component": "assistantdiaryentry"
        },
        {
          "icon": "fa fa-database",
          "label": "Amount Reimbursement",
          "to": "/dashboards/amountreimbursement",
          "component": "amountreimbursement"
        },
        {
          "icon": null,
          "label": "Approval",
          "to": "/dashboards/approval",
          "component": "approval"
        },
        {
          "icon": null,
          "label": "Bill Entry",
          "to": "/dashboards/billentry",
          "component": "billentry"
        },
        {
          "icon": null,
          "label": "Completed",
          "to": "/dashboards/completed",
          "component": "completed"
        }
      ]
    }
  ]
}

export default asoadmin;