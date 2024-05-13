const ora = {
    "module": "ora",
    "menu": [
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
        "icon": "fa fa-database",
        "label": "Masters",
        "content": [
          {
            "label": "Master Data",
            "to": "/dashboards/masters_data",
            "component": "masters_data"
          },
          {
            "label": "Master Child data",
            "to": "/dashboards/masters_child_data",
            "component": "masters_child_data"
          },
          {
            "label": "Custom Module",
            "to": "/dashboards/pm_custom",
            "component": "pm_custom"
          },
          {
            "label": "Custom Module Template",
            "to": "/dashboards/pm_custom_module_template",
            "component": "pm_custom_template"
          },
          {
            "label": "Master Rules", // todo
            "to": "/dashboards/master_agerelax",
            "component": "master_agerelax"
          },
          {
            "label": "Exam Streams",
            "to": "/dashboards/master_exam_streams",
            "component": "master_exam_streams"
          },
          {
            "label": "Exam Streams Rules",
            "to": "/dashboards/master_exam_stream_rule",
            "component": "master_exam_stream_rule"
          }
        ]
      },
    ]
  }
  
  
  export default ora
  