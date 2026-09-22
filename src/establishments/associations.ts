import { HospitalityEstablishment } from "./HospitalityEstablishment";
import { User } from "../auth/User";

const applyEstablishmentAssociations = () => {
  HospitalityEstablishment.hasMany(HospitalityEstablishment, {
    as: "branches",
    foreignKey: "parentEstablishmentId",
  });
  HospitalityEstablishment.belongsTo(HospitalityEstablishment, {
    as: "parent",
    foreignKey: "parentEstablishmentId",
  });
  HospitalityEstablishment.belongsTo(User, { as: "owner", foreignKey: "ownerId" });
};

export default applyEstablishmentAssociations;
