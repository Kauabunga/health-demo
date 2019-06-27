import { transformNotes } from "./PatientGpNotesState";

it("Should transform the notes into a composition", () => {
  const result = transformNotes(
    {
      carePlan: "carePlan",
      medicationRequest: "medicationRequest",
      procedure: "procedure",
      clinicalImpression: "clinicalImpression",
      currentPatient: { birthDate: "1000000", nhi: "nhi", vcareId: "vcareId" },
      notes: [
        {
          text: "asdfasdfasdf"
        },
        {
          text: "asdfasdfasdf"
        }
      ]
    },
    new Date("2019-06-19T21:03:58.678Z")
  );
  expect(result).toMatchSnapshot();
});
