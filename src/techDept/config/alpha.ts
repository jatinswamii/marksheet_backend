const alpha = {
  "module": "alpha",
  "menu": [
    {
      "icon": "fa fa-home",
      "label": "Dashboard",
      "to": "/dashboards/"
    },
    {
      "icon": "fa fa-magnifying-glass",
      "label": "Alpha Query",
      "content": [
        {
          "label": "Recruitment",
          "to": "/dashboards/alpha_query",
          "component": "alpha_query"
        },
        {
          "label": "Examination",
          "to": "/dashboards/alpha_query_exam",
          "component": "alpha_query_exam"
        },
      ]
    }
  ]
}

export default alpha;
