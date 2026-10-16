import { HospitalityEstablishment } from "./HospitalityEstablishment";
import { User } from "../auth/User";
import { AccommodationCategory } from "./AccommodationCategory";
import { EmploymentStat } from "./EmploymentStat";
import { WageStat } from "./WageStat";
import { GuestArrivalStat } from "./GuestArrivalStat";
import { OccupancyStat } from "./OccupancyStat";

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

  HospitalityEstablishment.hasMany(AccommodationCategory, {
    as: "accommodationCategories",
    foreignKey: "establishmentId",
  });
  HospitalityEstablishment.hasMany(EmploymentStat, { as: "employmentStats", foreignKey: "establishmentId" });
  HospitalityEstablishment.hasMany(WageStat, { as: "wageStats", foreignKey: "establishmentId" });
  HospitalityEstablishment.hasMany(GuestArrivalStat, { as: "guestArrivalStats", foreignKey: "establishmentId" });
  HospitalityEstablishment.hasMany(OccupancyStat, { as: "occupancyStats", foreignKey: "establishmentId" });
};

export default applyEstablishmentAssociations;
