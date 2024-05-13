const ptboard= {
    module: 'ptboard',
    menu: [
      {
        "icon": "fa fa-home",
        "label": "Dashboards",
        "content": [
          {
            "icon": "fa fa-user",
            "label": "Main",
            "to": "/dashboards/main",
            "component": "dashboard",
          },
          {
            "to": "/dashboards/candidate_list",
            "component": "totalcandidate",
            "isHidden": true,
          },
          {
            "to": "/dashboards/present_candidate_list",
            "component": "totalpcandidate",
            "isHidden": true,
          },
          {
            "to": "/dashboards/absent_candidate_list",
            "component": "totalacandidate",
            "isHidden": true,
          },

        ]
      },
      {
        "icon": "fa fa-user",
        "label": "Candidate Attendence",
        "content": [
          {
            "icon": "fa fa-user",
            "label": "Candidate Attendence",
            "to": "/dashboards/candidateAttendence",
            "component": "candidateattendence"
          }
        ]
      },
      {
        icon: 'fa fa-user',
        label: 'Total Candidate List',
        content: [
          {
            "icon": "fa fa-user",
            "label": "Total Candidates List",
            "to": "/dashboards/candidate_list",
            "component": "totalcandidate"
          }
        ],
      },
      {
        icon: 'fa fa-check',
        label: 'Total Present Candidates',
        content: [
          {
            "label": "Total Present Candidates",
            "to": "/dashboards/present_candidate_list",
            "component": "totalpcandidate"
          }
        ],
      },
      {
        icon: 'fa fa-times',
        label: 'Total Absent Candidate',
        content: [
          {
            "label": "Total Absent Candidates",
            "to": "/dashboards/absent_candidate_list",
            "component": "totalacandidate"
          }
        ],
      },
    ],
  }
  
  export default ptboard
  