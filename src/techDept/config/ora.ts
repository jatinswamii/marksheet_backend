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
          "to": "/dashboards/post_notices_ora",
          "component": "post_notices_ora"
        },
      ]
    },
    {
      "icon": "fa fa-clipboard",
      "label": "ORA",
      "content": [
        {
          "label": "Post Creation",
          "to": "/dashboards/posts",
          "component": "posts"
        },
        {
          "label": "Post Description",
          "to": "/dashboards/post_description",
          "component": "post_description"
        },
        {
          "label": "Post Modules",
          "to": "/dashboards/post_modules_ora",
          "component": "post_modules_ora"
        },
        {
          "label": "Post Rules",
          "to": "/dashboards/post_ora_rules",
          "component": "post_ora_rules"
        },
        {
          "label": "Post Qualification Level",
          "to": "/dashboards/post_qlevel_experience_ora",
          "component": "post_qlevel_experience_ora"
        },
        {
          "label": "IFC",
          "to": "/dashboards/ifc_preview_ora",
          "component": "ifc_preview_ora"
        },
        {
          "label": "Vacancy",
          "to": "/dashboards/post_vacancy",
          "component": "post_vacancy"
        },
        {
          "label": "Post Terms and Condition",
          "to": "/dashboards/post_ora_terms_and_condition",
          "component": "post_ora_terms_and_condition"
        },
      ]
    },
    {
      "icon": "fa fa-shield",
      "label": "Permission Management",
      "content": [
        {
          "label": "Users",
          "to": "/dashboards/my_users",
          "component": "my_users"
        },
        {
          "label": "Group Permissions",
          "to": "/dashboards/menu_group_permissions",
          "component": "menu_group_permissions"
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
          "label": "Active Inactive Module",
          "to": "/dashboards/active_inactive_forms",
          "component": "active_inactive_forms"
        },
        {
          "label": "Master Rules", // todo
          "to": "/dashboards/master_agerelax",
          "component": "master_agerelax"
        },
      ]
    },
    {
      "icon": "fa fa-exchange",
      "label": "Change Request",
      "content": [
        {
          "icon": "fa fa-gears",
          "label": "Approver",
          "to": "/dashboards/approver_change_request",
          "component": "approver_change_request"
        },
        {
          "icon": "fa fa-gears",
          "label": "Post Approver",
          "to": "/dashboards/ora_post_approver",
          "component": "ora_post_approver"
        },
      ]
    },
    {
      "icon": "fa fa-history",
      "label": "History",
      "content": [
        {
          "icon": "fa fa-table",
          "label": "Form History",
          "to": "/dashboards/form_history",
          "component": "form_history"
        }
      ]
    }
  ]
}


export default ora
