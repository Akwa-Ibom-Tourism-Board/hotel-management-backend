import { Transaction } from "sequelize";
import HospitalityEstablishment from "../../models/hospitalityEstablishments/hospitalityEstablishments";

const establishmentRepositories = {
  create: async (data: any, transaction?: Transaction | null) => {
    try {
      const newEstablishment = await HospitalityEstablishment.create(data, {
        transaction: transaction ?? null,
      });
      return newEstablishment;
    } catch (error: any) {
      throw new Error(
        `Error registering hospitality establishment: ${error.message}`
      );
    }
  },

  deleteOne: async (filter: any) => {
    try {
      const establishment = await HospitalityEstablishment.findOne({
        where: filter,
      });
      if (!establishment)
        throw new Error("Establishment not found in our database");
      await establishment.destroy();
      return establishment;
    } catch (error: any) {
      throw new Error(`Error deleting establishment: ${error.message}`);
    }
  },

  deleteMany: async (filter: any) => {
    try {
      const affectedRows = await HospitalityEstablishment.destroy({
        where: filter,
      });
      return { affectedRows };
    } catch (error: any) {
      throw new Error(`Error deleting establishments: ${error.message}`);
    }
  },

  getOne: async (
    filter: Record<string, any>,
    projection: any = null,
    include: boolean = false
  ) => {
    try {
      const establishment = await HospitalityEstablishment.findOne({
        where: filter,
        attributes: projection,
        include: include ? [{ all: true, nested: true }] : [],
      });
      return establishment;
    } catch (error: any) {
      throw new Error(`Error fetching establishment: ${error.message}`);
    }
  },

  getMany: async (
    filter: any,
    projection?: any,
    options?: any,
    order?: any
  ) => {
    try {
      const establishments = await HospitalityEstablishment.findAll({
        where: filter,
        attributes: projection,
        ...options,
        order,
      });
      return establishments;
    } catch (error: any) {
      throw new Error(`Error fetching establishments: ${error.message}`);
    }
  },
};

export default establishmentRepositories;

