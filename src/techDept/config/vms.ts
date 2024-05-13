const vms = {
  "module": "vms",
  "menu": [
    {
      "icon": "fa fa-home",
      "label": "Dashboard",
      "to": "/dashboards/"
    },
    // {
    //   "icon": "fa fa-sign-in",
    //   "label": "Exams",
    //   "content": [
    //     {
    //       "label": "Create Exam",
    //       "to": "/dashboards/create-exam",
    //       "component": "addexam"
    //     }
    //   ]
    // },
    {
      "icon": "fa fa-address-card",
      "label": "Co-ordinator",
      "content": [
        {
          "label": "Coordinator Details",
          "to": "/dashboards/coordinator-details",
          "component": "coordinatordetails"
        }
      ]
    },
    {
      "icon": "fa fa-gears",
      "label": "Venue Supervisor",
      "content": [
        {
          "label": "Create",
          "to": "/dashboards/venue-supervior",
          "component": "venusupervisor"
        }
      ]
    },
    {
      "icon": "fa fa-database",
      "label": "Manage Venue",
      "content": [
        {
          "label": "Create",
          "to": "/dashboards/create-vanue",
          "component": "createvanue"
        }
      ]
    },
    {
      "icon": "fa fa-gears",
      "label": "Manage Invigilator",
      "content": [
        {
          "label": "Create",
          "to": "/dashboards/create-service-invigilator",
          "component": "createserviceinvigilator"
        },
        {
          "label": "Retired Inivigilator",
          "to": "/dashboards/retired_inivigilator",
          "component": "retiredinivigilator"
        },
        {
          "label": "Add New Area",
          "to": "/dashboards/add-area",
          "component": "addnewarea"
        }
      ]
    },
    // {
    //   "icon": "fa fa-sign-in",
    //   "label": "Mobile Application",
    //   "content": [
    //     {
    //       "label": "VS Arrangement Day",
    //       "to": "/dashboards/vs-arrangement-day",
    //       "component": "vsarrangementday"
    //     },
    //     {
    //       "label": "VS Exam Day",
    //       "to": "/dashboards/vs-exam-day",
    //       "component": "vsexamday"
    //     },
    //     {
    //       "label": "VS Post Exam",
    //       "to": "/dashboards/vs-post-exam",
    //       "component": "vspostexam"
    //     }
    //   ]
    // }
  ]
}

export default vms