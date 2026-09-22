import { database } from "./database";
import "../auth/User";
import "../establishments/HospitalityEstablishment";
import "../establishments/EstablishmentCounter";
import applyEstablishmentAssociations from "../establishments/associations";

export async function syncDatabases() {
  console.log("📥 Registering models...");
  applyEstablishmentAssociations();

  console.log("🔄 Syncing databases...");
  await database.sync({});
  console.log("✅ All databases synced successfully");
}
