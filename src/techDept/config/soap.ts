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
      "icon": "fa fa-bullhorn",
      "label": "Notice",
      "content": [
        {
          "label": "Create Notice",
          "to": "/dashboards/post_notices_soap",
          "component": "post_notices_soap"
        },
      ]
    },
    {
      "icon": "fa fa-clipboard",
      "label": "SOAP",
      "content": [
        {
          "label": "Post Creation",
          "to": "/dashboards/posts_soap",
          "component": "posts_soap"
        },
        {
          "label": "Post Description",
          "to": "/dashboards/post_description_soap",
          "component": "post_description_soap"
        },
        // {
        //   "label": "Post Modules",
        //   "to": "/dashboards/post_modules_soap",
        //   "component": "post_modules_soap"
        // },
        {
          "label": "Post Exam Rules",
          "to": "/dashboards/post_exam_stream_rules",
          "component": "post_exam_stream_rules"
        },
        {
          "label": "Post Rules",
          "to": "/dashboards/post_soap_rules",
          "component": "post_soap_rules"
        },
        {
          "label": "Post Terms and Condition",
          "to": "/dashboards/post_soap_terms_and_condition",
          "component": "post_soap_terms_and_condition"
        },
        // {
        //   "label": "Post Qualification Level",
        //   "to": "/dashboards/post_qlevel_experience_soap",
        //   "component": "post_qlevel_experience_soap"
        // },
        // {
        //   "label": "IFC",
        //   "to": "/dashboards/ifc_preview_soap",
        //   "component": "ifc_preview_soap"
        // },
        // {
        //   "label": "Vacancy",
        //   "to": "/dashboards/post_vacancy_soap",
        //   "component": "post_vacancy_soap"
        // },
      ]
    },
    // {
    //   "icon": "fa fa-shield",
    //   "label": "Permission Management",
    //   "content": [
    //     {
    //       "label": "Users",
    //       "to": "/dashboards/my_users",
    //       "component": "my_users"
    //     },
    //     {
    //       "label": "Group Permissions",
    //       "to": "/dashboards/menu_group_permissions",
    //       "component": "menu_group_permissions"
    //     }
    //   ]
    // },
    // {
    //   "icon": "fa fa-database",
    //   "label": "Masters",
    //   "content": [
    //     {
    //       "label": "Master Data",
    //       "to": "/dashboards/masters_data",
    //       "component": "masters_data"
    //     },
    //     {
    //       "label": "Master Child data",
    //       "to": "/dashboards/masters_child_data",
    //       "component": "masters_child_data"
    //     },
    //     {
    //       "label": "Custom Module",
    //       "to": "/dashboards/pm_custom",
    //       "component": "pm_custom"
    //     },
    //     {
    //       "label": "Custom Module Template",
    //       "to": "/dashboards/pm_custom_module_template",
    //       "component": "pm_custom_template"
    //     },
    //     {
    //       "label": "Master Rules", // todo
    //       "to": "/dashboards/master_agerelax",
    //       "component": "master_agerelax"
    //     },
    //     {
    //       "label": "Exam Streams",
    //       "to": "/dashboards/master_exam_streams",
    //       "component": "master_exam_streams"
    //     },
    //     {
    //       "label": "Exam Streams Rules",
    //       "to": "/dashboards/master_exam_stream_rule",
    //       "component": "master_exam_stream_rule"
    //     }
    //   ]
    // },
    // {
    //   "icon": "fa fa-exchange",
    //   "label": "Change Request",
    //   "content": [
    //     {
    //       "icon": "fa fa-gears",
    //       "label": "Approver",
    //       "to": "/dashboards/approver_change_request",
    //       "component": "approver_change_request"
    //     },
    //     {
    //       "icon": "fa fa-gears",
    //       "label": "Post Approver",
    //       "to": "/dashboards/soap_post_approver",
    //       "component": "soap_post_approver"
    //     },
    //   ]
    // }
  ]
}


export default ora
