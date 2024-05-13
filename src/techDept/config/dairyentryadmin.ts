import { T } from "ramda";

const diaryentryadmin = {
  "module": "diaryentryadmin",
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
        }
      ]
    }
  ]
}

export default diaryentryadmin;