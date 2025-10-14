import { Transaction } from "sequelize";
import EstablishmentIdCounter from "../../models/establishmentIdCounter/establishmentCounter";

const establishmentIdRepositories = {
  create: async (data: any, transaction?: Transaction | null) => {
    try {
      const newEstablishment = await EstablishmentIdCounter.create(data, {
        transaction: transaction ?? null,
      });
      return newEstablishment;
    } catch (error: any) {
      throw new Error(`Error creating Id Counter: ${error.message}`);
    }
  },

  handleUpdates: async (update: any, options: any) => {
    try {
      const [affectedRows] = await EstablishmentIdCounter.update(
        update,
        options
      );
      return { affectedRows };
    } catch (error: any) {
      throw new Error(`Error updating Id Counter: ${error.message}`);
    }
  },

  //   deleteOne: async (filter: any) => {
  //     try {
  //       const establishment = await EstablishmentIdCounter.findOne({
  //         where: filter,
  //       });
  //       if (!establishment)
  //         throw new Error("Establishment not found in our database");
  //       await establishment.destroy();
  //       return establishment;
  //     } catch (error: any) {
  //       throw new Error(`Error deleting establishment: ${error.message}`);
  //     }
  //   },

  //   deleteMany: async (filter: any) => {
  //     try {
  //       const affectedRows = await EstablishmentIdCounter.destroy({
  //         where: filter,
  //       });
  //       return { affectedRows };
  //     } catch (error: any) {
  //       throw new Error(`Error deleting establishments: ${error.message}`);
  //     }
  //   },

  getOne: async (
    filter: Record<string, any>,
    projection: any = null,
  ) => {
    try {
      const establishment = await EstablishmentIdCounter.findOne({
        where: filter,
        attributes: projection,
        order: [['createdAt', 'DESC']]
      });
      return establishment;
    } catch (error: any) {
      throw new Error(`Error fetching Id Counter: ${error.message}`);
    }
  },

  getMany: async (
    filter: any,
    projection?: any,
    options?: any,
    order?: any
  ) => {
    try {
      const establishments = await EstablishmentIdCounter.findAll({
        where: filter,
        attributes: projection,
        ...options,
        order,
      });
      return establishments;
    } catch (error: any) {
      throw new Error(`Error fetching Id Counters: ${error.message}`);
    }
  },
};

export default establishmentIdRepositories;
