
const candidate = {
  "module": "candidate",
  "menu": [
    {
      "icon": "fa fa-database",
      "label": "Dashboards",
      "content": [
        {
          "icon": "fa fa-gears",
          "label": "Main",
          "to": "/dashboards/main",
          "component": "main"
        },
        {
          "icon": "fa fa-gears",
          "label": "Notification Dashboard",
          "to": "/dashboards/exam_notices",
          "component": "exam_notices"
        },
        {
          "icon": "fa fa-gears",
          "label": "Candidate Applications",
          "to": "/dashboards/application",
          "component": "candidate_application",
          "isHidden": true,
        },
        {
          "icon": "fa fa-gears",
          "label": "Candidate DAF Forms",
          "to": "/dashboards/candidate_daf_tab",
          "component": "candidate_daf_tab",
          "isHidden": true,
        },
        {
          "icon": "fa fa-gears",
          "label": "Change Password",
          "to": "/dashboards/change_password",
          "component": "candidate_password",
          "isHidden": true,
        },
        {
          "icon": "fa fa-gears",
          "label": "Change Email",
          "to": "/dashboards/change_update",
          "component": "candidate_update_email",
          "isHidden": true,
        },
      ]
    },
    {
      "icon": "fa fa-address-card",
      "label": "Profile",
      "content": [
        {
          "label": "Registration",
          "to": "/dashboards/otrview",
          "component": "otrview"
        },
        {
          "label": "Detail Profile",
          "to": "/dashboards/candidate_daf",
          "component": "candidate_daf"
        },
        {
          "label": "Photo & Signature",
          "to": "/dashboards/candidate_photo_signature",
          "component": "candidate_photo_signature"
        },
        {
          "label": "Contact Information",
          "to": "/dashboards/candidate_address",
          "component": "candidate_address"
        },
        {
          "label": "Education Qualification",
          "to": "/dashboards/candidate_qualification",
          "component": "candidate_qualification"
        },
        {
          "label": "Experience",
          "to": "/dashboards/candidate_experience",
          "component": "candidate_experience"
        }
      ]
    },
    {
      "icon": 'fa fa-people-group',
      "label": 'Community',
      "to": "/dashboards/candidate_community",
      "component": "candidate_community"
    },
    {
      "icon": "fa fa-wheelchair",
      "label": "Physically Challenged",
      "to": "/dashboards/candidate_ph",
      "component": "candidate_ph"
    },
    // {
    //   "icon": 'fa fa-universal-access',
    //   "label": 'Additional Certificates',
    //   "to": "/dashboards/agerelax",
    //   "component": "agerelax_woman",
    // },
    {
      "icon": "fa fa-exchange",
      "label": "Change request",
      "content": [
        {
          "label": "Apply",
          "to": "/dashboards/change_request",
          "component": "change_request"
        }
      ]
    },
    {
      "icon": "fa fa-paste",
      "label": "Latest Notification",
      "content": [
        {
          "label": "term and condition",
          "to": "/dashboards/terms-and-conditions",
          "component": "trems_and_conditions",
          "isHidden": true,
        },
        {
          "label": "Recruitment",
          "to": "/dashboards/recruitment",
          "component": "recruitment"
        },
        {
          "label": "Examination",
          "to": "/dashboards/examination",
          "component": "examination"
        }
      ]
    },
    {
      "icon": "fa fa-paste",
      "label": "Candidate DAF",
      "content": [
        {
          "label": "Parent Basic Information",
          "to": "/dashboards/parental_information",
          "component": "parental_information"
        },
        {
          "label": "Parent Profession",
          "to": "/dashboards/parent_profession",
          "component": "parent_profession"
        },
        {
          "label": "Parent Income",
          "to": "/dashboards/parent_income",
          "component": "parent_income"
        },
        {
          "label": "Family Assets",
          "to": "/dashboards/candidate_family_assets",
          "component": "candidate_family_assets"
        },
        {
          "label": "Recommended By UPSC ",
          "to": "/dashboards/upsc_recommended",
          "component": "upsc_recommended"
        },
        {
          "label": "UPSC Exam History",
          "to": "/dashboards/daf_upsc_history",
          "component": "daf_upsc_history"
        },
        {
          "label": "Zone Preferences",
          "to": "/dashboards/zone_preferences",
          "component": "zone_preferences"
        }
        
      ]
    },
    // {
    //   "icon": "fa fa-file-text",
    //   "label": "Annexure",
    //   "content": [
    //     {
    //       "label": "Scribe Information",
    //       "to": "/dashboards/candidate_scribe",
    //       "component": "candidate_scribe"
    //     }
    //   ]
    // },

  ]
}

export default candidate;