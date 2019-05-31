import { transformPatient, getDummyPatient } from "./PatientState";

it("Should get the next of kin", () => {
  const result = transformPatient(getDummyPatient());
  delete result.__original__;
  expect(result).toMatchSnapshot();
});
