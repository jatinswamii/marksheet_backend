const exam = {
  "module": "exam",
  "menu": [
    {
      "icon": "fa fa-home",
      "label": "Dashboard",
      "to": "/dashboards/"
    },
    {
      "icon": "fa fa-sign-in",
      "label": "SAL",
      "content": [
        {
          "label": "SAL Printing",
          "to": "/dashboards/omr-sheet",
          "component": "omrsheet"
        },
        {
          "label": "Attendance Sheet",
          "to": "/dashboards/sal",
          "component": "sal"
        }
      ]
    },
    {
      "icon": "fa fa-stamp",
      "label": "Admit Card",
      "content": [
        {
          "label": "Admit Card",
          "to": "/dashboards/admit-card",
          "component": "admitcard"
        },
        {
          "label": "AC SPECIALLY ABLED",
          "to": "/dashboards/ac-specially-abled",
          "component": "acadmitcard"
        },
        {
          "label": "Scribe",
          "to": "/dashboards/scribe",
          "component": "scribe"
        }
      ]
    },
    {
      "icon": "fa fa-pen-nib",
      "label": "Exam",
      "content": [
        {
          "label": "Exam Schedule",
          "to": "/dashboards/exams_schedules",
          "component": "exams_schedules"
        }
      ]
    },
    {
      "icon": "fa fa-marker",
      "label": "SSB Marks",
      "content": [
        {
          "label": "Marks Entry (Operator 1)",
          "to": "/dashboards/result_ssb_marks1",
          "component": "result_ssb_marks1"
        },
        {
          "label": "Marks Entry (Operator 2)",
          "to": "/dashboards/result_ssb_marks2",
          "component": "result_ssb_marks2"
        },
        {
          "label": "Unmatched Marks",
          "to": "/dashboards/results_ssb_marks_unmatched",
          "component": "results_ssb_marks_unmatched"
        },
        {
          "label": "Result SSB Marks (Final)",
          "to": "/dashboards/results_ssb_marks_final",
          "component": "results_ssb_marks_final"
        }
      ]
    }
  ]
}

export default exam;
