const courtcase = {
  "module": "courtcase",
  "menu": [
    {
      "icon": "fa fa-home",
      "label": "Dashboard",
      "to": "/dashboards/"
    },
    {
      "icon": "fa fa-sign-in",
      "label": "Court case",
      "content": [
        {
          "label": "Add New case",
          "to": "/dashboards/addnewcase",
          "component": "addnewcase"
        },
        {
          "label": "Add new counsel",
          "to": "/dashboards/newcounsel",
          "component": "addnewcounsel"
        },
        {
          "label": "Add new Bill For Court Cases",
          "to": "/dashboards/addnewbillforcourt",
          "component": "addnewbillforcourt"
        },
        {
          "label": "Add new Bill For Legel Openion",
          "to": "/dashboards/courtbilllegal",
          "component": "addnewbillforlegel"
        },
        {
          "label": "Case Reports",
          "to": "/dashboards/Casereport",
          "component": "Casereport"
        },
        {
          "label": "Bill Reports",
          "to": "/dashboards/BillReport",
          "component": "BillReport"
        }
      ]
    }
  ]
}

export default courtcase;