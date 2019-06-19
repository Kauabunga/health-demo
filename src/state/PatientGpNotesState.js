//

function getDummyGPNotesSubmitComposition() {
  return {
    resourceType: "Composition",
    contained: [
      {
        resourceType: "CarePlan",
        id: "60461e26-3cc9-4926-80fa-ced6879b44d9",
        text: {}
      },
      {
        resourceType: "MedicationRequest",
        id: "a4120ec3-e3fa-4a25-9e61-3e1d2af753b0",
        text: {
          div: '<div xmlns="http://www.w3.org/1999/xhtml">Give her some medication</div>'
        }
      },
      {
        resourceType: "Procedure",
        id: "4d1e4def-adf8-4005-866b-af789507c5db",
        text: {
          div: '<div xmlns="http://www.w3.org/1999/xhtml">Administer medication and observe</div>'
        }
      },
      {
        resourceType: "Observation",
        id: "ef9a187a-f5f7-44b7-abe6-fda5fe0d20a5",
        text: {
          div: '<div xmlns="http://www.w3.org/1999/xhtml">Coughs loudly</div>'
        }
      },
      {
        resourceType: "Observation",
        id: "7e248869-0eb4-4920-9c9e-960a8e7e7830",
        text: {
          div: '<div xmlns="http://www.w3.org/1999/xhtml">Sore chest</div>'
        }
      },
      {
        resourceType: "Condition",
        id: "f87f6532-b9de-4349-af16-cdb2d9982d5d",
        text: {
          div: '<div xmlns="http://www.w3.org/1999/xhtml">Diabetes</div>'
        }
      },
      {
        resourceType: "Condition",
        id: "a83ff0eb-0323-42d9-a6e3-7aa9d573e090",
        text: {
          div: '<div xmlns="http://www.w3.org/1999/xhtml">Rabies</div>'
        }
      },
      {
        resourceType: "ClinicalImpression",
        id: "0e45c1c7-8b74-469a-91b1-760ff6707829",
        text: {
          div: '<div xmlns="http://www.w3.org/1999/xhtml">We are clinically impressed!</div>'
        }
      },
      {
        resourceType: "Patient",
        id: "add8e052-d291-45a4-ade7-5c92fe0a6c25",
        identifier: [
          {
            use: "secondary",
            system: "http://rymanhealthcare.co.nz",
            value: "2143.5"
          },
          {
            use: "official",
            system: "http://health.govt.nz/nhi",
            value: "ZGD5674"
          }
        ],
        birthDate: "1912-11-10"
      },
      {
        resourceType: "Organization",
        id: "8e6eb900-9ce7-4d1a-af10-1955257a57f9",
        name: "Dr Phil's Practice"
      },
      {
        resourceType: "Practitioner",
        id: "635180ed-7ad3-4672-bb24-4a600e14e432",
        name: [
          {
            given: ["Phil"],
            prefix: ["Dr"]
          }
        ]
      }
    ],
    identifier: {
      system: "http://mypractice.co.nz/Notes",
      value: "12345"
    },
    status: "final",
    type: {
      coding: [
        {
          code: "75476-2",
          display: "Physician Note"
        }
      ]
    },
    category: [
      {
        coding: [
          {
            code: "11488-4",
            display: "Consult note"
          }
        ]
      }
    ],
    subject: {
      reference: "#add8e052-d291-45a4-ade7-5c92fe0a6c25",
      type: "Patient"
    },
    date: "2019-05-30T12:00:00Z",
    author: [
      {
        reference: "#635180ed-7ad3-4672-bb24-4a600e14e432"
      }
    ],
    title: "GP notes",
    custodian: {
      reference: "#8e6eb900-9ce7-4d1a-af10-1955257a57f9"
    },
    section: [
      {
        code: {
          coding: [
            {
              code: "29545-1"
            }
          ]
        },
        entry: [
          {
            reference: "#0e45c1c7-8b74-469a-91b1-760ff6707829",
            type: "ClinicalImpression"
          }
        ]
      },
      {
        code: {
          coding: [
            {
              code: "51848-0"
            }
          ]
        },
        entry: [
          {
            reference: "#f87f6532-b9de-4349-af16-cdb2d9982d5d",
            type: "Condition"
          },
          {
            reference: "#a83ff0eb-0323-42d9-a6e3-7aa9d573e090",
            type: "Condition"
          }
        ]
      },
      {
        code: {
          coding: [
            {
              code: "29554-3"
            }
          ]
        },
        entry: [
          {
            reference: "#4d1e4def-adf8-4005-866b-af789507c5db",
            type: "Procedure"
          }
        ]
      },
      {
        code: {
          coding: [
            {
              code: "18776-5"
            }
          ]
        },
        entry: [
          {
            reference: "#60461e26-3cc9-4926-80fa-ced6879b44d9",
            type: "CarePlan"
          }
        ]
      },
      {
        code: {
          coding: [
            {
              code: "8716-3"
            }
          ]
        },
        entry: [
          {
            reference: "#ef9a187a-f5f7-44b7-abe6-fda5fe0d20a5",
            type: "Observation"
          },
          {
            reference: "#7e248869-0eb4-4920-9c9e-960a8e7e7830",
            type: "Observation"
          }
        ]
      },
      {
        code: {
          coding: [
            {
              code: "18776-5"
            }
          ]
        },
        entry: [
          {
            reference: "#a4120ec3-e3fa-4a25-9e61-3e1d2af753b0",
            type: "MedicationRequest"
          }
        ]
      }
    ]
  };
}
