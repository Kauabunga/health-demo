import { transformPatient, getDummyPatient } from "./PatientState";

it("Should get the next of kin", () => {
  //

  const result = transformPatient(getDummyPatient());
  delete result.__original__;
  expect(result).toEqual({
    address: "D003, Dementia, Ada Lovelace, OTHER",
    birthDate: "1931-08-18",
    email: "Willow.Foster@residents.AdaLovelace.testvillages.rymanhealthcare.com",
    gender: "unknown",
    initials: "WF",
    name: "Willow Foster",
    photo: "",
    nextOfKin: {
      email: "kane.foster@nok.adalovelace.testvillages.rymanhealthcare.com",
      name: "Kane Foster",
      phone: "tel:+64-55-51234567"
    }
  });
});
